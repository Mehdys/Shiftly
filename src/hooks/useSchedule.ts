import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { Assignment, Group } from '@/types';
import { generateSchedule } from '@/utils';

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
// ASSIGNMENTS (SCHEDULE)
// ============================================================================

export function useAssignments(serviceId: string | undefined) {
    return useQuery({
        queryKey: ['assignments', serviceId],
        queryFn: async () => {
            if (!serviceId) return [];

            log('useAssignments - Fetching for service', serviceId);

            const { data, error } = await supabase
                .from('assignments')
                .select(`
          *,
          group:groups(id, name, emoji)
        `)
                .eq('service_id', serviceId)
                .order('date', { ascending: true });

            if (error) {
                log('useAssignments - Error', null, error);
                throw error;
            }

            log('useAssignments - Success', data);
            return data as (Assignment & { group: Group })[];
        },
        enabled: !!serviceId,
    });
}

export function useGenerateSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            serviceId: string;
            startDate: string;
            endDate: string;
            groups: Group[];
        }) => {
            log('useGenerateSchedule - Starting', {
                serviceId: input.serviceId,
                groupCount: input.groups.length
            });

            // Step 1: Generate schedule using round-robin algorithm
            log('useGenerateSchedule - Step 1: Running algorithm...');
            const assignments = generateSchedule(
                input.groups,
                input.startDate,
                input.endDate
            );
            log('useGenerateSchedule - Step 1 OK', { count: assignments.length });

            // Step 2: Delete existing assignments
            log('useGenerateSchedule - Step 2: Deleting old assignments...');
            const { error: deleteError } = await supabase
                .from('assignments')
                .delete()
                .eq('service_id', input.serviceId);

            if (deleteError) {
                log('useGenerateSchedule - Step 2 FAILED', null, deleteError);
                throw deleteError;
            }
            log('useGenerateSchedule - Step 2 OK');

            // Step 3: Insert new assignments
            log('useGenerateSchedule - Step 3: Inserting new assignments...');
            const { data, error } = await supabase
                .from('assignments')
                .insert(assignments)
                .select();

            if (error) {
                log('useGenerateSchedule - Step 3 FAILED', null, error);
                throw error;
            }
            log('useGenerateSchedule - Step 3 OK');

            // Step 4: Lock the service
            log('useGenerateSchedule - Step 4: Locking service...');
            await supabase
                .from('services')
                .update({ locked: true })
                .eq('id', input.serviceId);
            log('useGenerateSchedule - Step 4 OK');

            log('useGenerateSchedule - SUCCESS');
            return data as Assignment[];
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['assignments', variables.serviceId] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: (error) => {
            log('useGenerateSchedule - Mutation error handler', null, error);
        },
    });
}

// ============================================================================
// ASSIGNMENT BY DATE
// ============================================================================

export function useAssignmentByDate(serviceId: string | undefined, date: string | undefined) {
    return useQuery({
        queryKey: ['assignment', serviceId, date],
        queryFn: async () => {
            if (!serviceId || !date) return null;

            log('useAssignmentByDate - Fetching', { serviceId, date });

            const { data, error } = await supabase
                .from('assignments')
                .select(`
          *,
          group:groups(id, name, emoji, members:interns(id, name))
        `)
                .eq('service_id', serviceId)
                .eq('date', date)
                .single();

            if (error && error.code !== 'PGRST116') {
                log('useAssignmentByDate - Error', null, error);
                throw error;
            }

            log('useAssignmentByDate - Result', data);
            return data as (Assignment & { group: Group & { members: { id: string; name: string }[] } }) | null;
        },
        enabled: !!serviceId && !!date,
    });
}

// ============================================================================
// TODAY'S ASSIGNMENT
// ============================================================================

export function useTodayAssignment(serviceId: string | undefined) {
    const today = new Date().toISOString().split('T')[0];
    return useAssignmentByDate(serviceId, today);
}
