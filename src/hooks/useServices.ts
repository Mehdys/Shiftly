import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import type { Service, Intern } from '@/types';
import { generateJoinCode } from '@/utils';

// ============================================================================
// LOGGING HELPER
// ============================================================================

const log = (action: string, data?: unknown, error?: unknown) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    if (error) {
        console.error(`[${timestamp}] ❌ ${action}:`, error);
    } else {
        console.log(`[${timestamp}] ✅ ${action}:`, data);
    }
};

// ============================================================================
// SERVICES
// ============================================================================

export function useService(joinCode: string | undefined) {
    return useQuery({
        queryKey: ['service', joinCode],
        queryFn: async () => {
            if (!joinCode) return null;

            log('useService - Searching for code', joinCode);

            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('join_code', joinCode.toUpperCase())
                .single();

            if (error) {
                log('useService - Error', null, error);
                throw error;
            }

            log('useService - Found service', data);
            return data as Service;
        },
        enabled: !!joinCode,
    });
}

export function useServiceById(serviceId: string | undefined) {
    return useQuery({
        queryKey: ['service', 'id', serviceId],
        queryFn: async () => {
            if (!serviceId) return null;

            log('useServiceById - Fetching', serviceId);

            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', serviceId)
                .single();

            if (error) {
                log('useServiceById - Error', null, error);
                throw error;
            }

            log('useServiceById - Found', data);
            return data as Service;
        },
        enabled: !!serviceId,
    });
}

export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            name: string;
            startDate: string;
            endDate: string;
            adminName: string;
        }) => {
            log('useCreateService - Starting', input);

            // Check Supabase configuration
            if (!isSupabaseConfigured()) {
                log('useCreateService - Supabase NOT configured', null, 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
                throw new Error('Supabase not configured. Check your .env file.');
            }

            const joinCode = generateJoinCode();
            log('useCreateService - Generated join code', joinCode);

            // Step 1: Create service
            log('useCreateService - Step 1: Creating service...');
            const { data: service, error: serviceError } = await supabase
                .from('services')
                .insert({
                    name: input.name,
                    start_date: input.startDate,
                    end_date: input.endDate,
                    join_code: joinCode,
                })
                .select()
                .single();

            if (serviceError) {
                log('useCreateService - Step 1 FAILED', null, serviceError);
                throw serviceError;
            }
            log('useCreateService - Step 1 OK', service);

            // Step 2: Create admin intern
            log('useCreateService - Step 2: Creating admin intern...');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Vous devez être connecté pour créer un service.');

            const { data: intern, error: internError } = await supabase
                .from('interns')
                .insert({
                    user_id: session.user.id,
                    service_id: service.id,
                    name: input.adminName,
                    is_admin: true,
                })
                .select()
                .single();

            if (internError) {
                log('useCreateService - Step 2 FAILED', null, internError);
                throw internError;
            }
            log('useCreateService - Step 2 OK', intern);

            // Step 3: Update service with created_by
            log('useCreateService - Step 3: Updating service.created_by...');
            const { error: updateError } = await supabase
                .from('services')
                .update({ created_by: intern.id })
                .eq('id', service.id);

            if (updateError) {
                log('useCreateService - Step 3 FAILED', null, updateError);
                // Non-critical, continue
            } else {
                log('useCreateService - Step 3 OK');
            }

            log('useCreateService - SUCCESS', { service, intern });
            return { service: service as Service, intern: intern as Intern };
        },
        onSuccess: () => {
            log('useCreateService - Invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: (error) => {
            log('useCreateService - Mutation error handler', null, error);
        },
    });
}

// ============================================================================
// INTERNS
// ============================================================================

export function useInterns(serviceId: string | undefined) {
    return useQuery({
        queryKey: ['interns', serviceId],
        queryFn: async () => {
            if (!serviceId) return [];

            log('useInterns - Fetching for service', serviceId);

            const { data, error } = await supabase
                .from('interns')
                .select('*')
                .eq('service_id', serviceId)
                .order('joined_at', { ascending: true });

            if (error) {
                log('useInterns - Error', null, error);
                throw error;
            }

            log('useInterns - Found', data);
            return data as Intern[];
        },
        enabled: !!serviceId,
    });
}

export function useJoinService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { joinCode: string; name: string }) => {
            log('useJoinService - Starting', input);

            // Find service by code
            log('useJoinService - Step 1: Finding service...');
            const { data: service, error: serviceError } = await supabase
                .from('services')
                .select('*')
                .eq('join_code', input.joinCode.toUpperCase())
                .single();

            if (serviceError) {
                log('useJoinService - Step 1 FAILED', null, serviceError);
                throw new Error('Code invalide');
            }
            log('useJoinService - Step 1 OK', service);

            // Create intern
            log('useJoinService - Step 2: Creating intern...');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Vous devez être connecté pour rejoindre un service.');

            const { data: intern, error: internError } = await supabase
                .from('interns')
                .insert({
                    user_id: session.user.id,
                    service_id: service.id,
                    name: input.name,
                    is_admin: false,
                })
                .select()
                .single();

            if (internError) {
                log('useJoinService - Step 2 FAILED', null, internError);
                throw internError;
            }
            log('useJoinService - Step 2 OK', intern);

            log('useJoinService - SUCCESS', { service, intern });
            return { service: service as Service, intern: intern as Intern };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interns'] });
        },
        onError: (error) => {
            log('useJoinService - Mutation error handler', null, error);
        },
    });
}
