import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import type { Group, JoinRequest, Intern } from '@/types';

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
// GROUPS
// ============================================================================

export function useGroups(serviceId: string | undefined) {
    return useQuery({
        queryKey: ['groups', serviceId],
        queryFn: async () => {
            if (!serviceId) return [];

            log('useGroups - Fetching for service', serviceId);

            const { data, error } = await supabase
                .from('groups')
                .select(`
          *,
          members:interns(id, name)
        `)
                .eq('service_id', serviceId)
                .order('created_at', { ascending: true });

            if (error) {
                log('useGroups - Error', null, error);
                throw error;
            }

            // Transform to include member_count
            const transformed = data.map(group => ({
                ...group,
                member_count: group.members?.length || 0,
            }));

            log('useGroups - Success', transformed);
            return transformed as (Group & { member_count: number })[];
        },
        enabled: !!serviceId,
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            serviceId: string;
            name: string;
            emoji: string;
            maxSize?: number;
            createdBy: string;
        }) => {
            log('useCreateGroup - Starting', input);

            // Step 1: Create the group
            log('useCreateGroup - Step 1: Creating group...');
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    service_id: input.serviceId,
                    name: input.name,
                    emoji: input.emoji,
                    max_size: input.maxSize || null,
                    created_by: input.createdBy,
                })
                .select()
                .single();

            if (groupError) {
                log('useCreateGroup - Step 1 FAILED', null, groupError);
                throw groupError;
            }
            log('useCreateGroup - Step 1 OK', group);

            // Step 2: Add creator to the group
            log('useCreateGroup - Step 2: Assigning creator to group...');
            const { error: updateError } = await supabase
                .from('interns')
                .update({ group_id: group.id })
                .eq('id', input.createdBy);

            if (updateError) {
                log('useCreateGroup - Step 2 FAILED', null, updateError);
                throw updateError;
            }
            log('useCreateGroup - Step 2 OK');

            log('useCreateGroup - SUCCESS', group);
            return group as Group;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups', variables.serviceId] });
            queryClient.invalidateQueries({ queryKey: ['interns'] });
        },
        onError: (error) => {
            log('useCreateGroup - Mutation error handler', null, error);
        },
    });
}

// ============================================================================
// JOIN REQUESTS
// ============================================================================

export function useJoinRequests(groupId: string | undefined) {
    return useQuery({
        queryKey: ['joinRequests', groupId],
        queryFn: async () => {
            if (!groupId) return [];

            log('useJoinRequests - Fetching for group', groupId);

            const { data, error } = await supabase
                .from('join_requests')
                .select(`
          *,
          intern:interns(id, name)
        `)
                .eq('group_id', groupId)
                .eq('status', 'pending')
                .order('requested_at', { ascending: true });

            if (error) {
                log('useJoinRequests - Error', null, error);
                throw error;
            }

            log('useJoinRequests - Success', data);
            return data as (JoinRequest & { intern: Intern })[];
        },
        enabled: !!groupId,
    });
}

export function useMyJoinRequests(internId: string | undefined) {
    return useQuery({
        queryKey: ['myJoinRequests', internId],
        queryFn: async () => {
            if (!internId) return [];

            log('useMyJoinRequests - Fetching for intern', internId);

            const { data, error } = await supabase
                .from('join_requests')
                .select(`
          *,
          group:groups(id, name, emoji)
        `)
                .eq('intern_id', internId)
                .order('requested_at', { ascending: false });

            if (error) {
                log('useMyJoinRequests - Error', null, error);
                throw error;
            }

            log('useMyJoinRequests - Success', data);
            return data as (JoinRequest & { group: Group })[];
        },
        enabled: !!internId,
    });
}

/**
 * Fetches all pending join requests for all groups created by the current user
 */
export function useManagedRequests(internId: string | undefined) {
    return useQuery({
        queryKey: ['managedRequests', internId],
        queryFn: async () => {
            if (!internId) return [];

            log('useManagedRequests - Fetching for creator', internId);

            // First get all groups created by this user
            const { data: myGroups, error: groupsError } = await supabase
                .from('groups')
                .select('id')
                .eq('created_by', internId);

            if (groupsError) throw groupsError;
            if (!myGroups || myGroups.length === 0) return [];

            const myGroupIds = myGroups.map(g => g.id);

            // Then get all pending requests for these groups
            const { data, error } = await supabase
                .from('join_requests')
                .select(`
          *,
          intern:interns(id, name),
          group:groups(id, name, emoji)
        `)
                .in('group_id', myGroupIds)
                .eq('status', 'pending')
                .order('requested_at', { ascending: true });

            if (error) {
                log('useManagedRequests - Error', null, error);
                throw error;
            }

            log('useManagedRequests - Success', data);
            return data as (JoinRequest & { intern: Intern; group: Group })[];
        },
        enabled: !!internId,
    });
}

export function useRequestToJoin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { groupId: string; internId: string }) => {
            log('useRequestToJoin - Starting', input);

            const { data, error } = await supabase
                .from('join_requests')
                .insert({
                    group_id: input.groupId,
                    intern_id: input.internId,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) {
                log('useRequestToJoin - Error', null, error);
                throw error;
            }

            log('useRequestToJoin - Success', data);
            return data as JoinRequest;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['joinRequests', variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ['myJoinRequests', variables.internId] });
        },
        onError: (error) => {
            log('useRequestToJoin - Error handler', null, error);
        },
    });
}

export function useRespondToRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            requestId: string;
            approved: boolean;
            internId: string;
            groupId: string;
        }) => {
            log('useRespondToRequest - Starting', input);

            // Step 1: Update request status
            log('useRespondToRequest - Step 1: Updating request...');
            const { error: requestError } = await supabase
                .from('join_requests')
                .update({
                    status: input.approved ? 'approved' : 'declined',
                    responded_at: new Date().toISOString(),
                })
                .eq('id', input.requestId);

            if (requestError) {
                log('useRespondToRequest - Step 1 FAILED', null, requestError);
                throw requestError;
            }
            log('useRespondToRequest - Step 1 OK');

            // Step 2: If approved, add intern to group
            if (input.approved) {
                log('useRespondToRequest - Step 2: Adding intern to group...');
                const { error: updateError } = await supabase
                    .from('interns')
                    .update({ group_id: input.groupId })
                    .eq('id', input.internId);

                if (updateError) {
                    log('useRespondToRequest - Step 2 FAILED', null, updateError);
                    throw updateError;
                }
                log('useRespondToRequest - Step 2 OK');
            }

            log('useRespondToRequest - SUCCESS', { approved: input.approved });
            return { approved: input.approved, groupId: input.groupId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['joinRequests', data.groupId] });
            queryClient.invalidateQueries({ queryKey: ['managedRequests'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['interns'] });
        },
        onError: (error) => {
            log('useRespondToRequest - Error handler', null, error);
        },
    });
}

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export function useGroupsRealtime(serviceId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!serviceId) return;

        log('useGroupsRealtime - Initializing subscription', serviceId);

        const channel = supabase
            .channel(`groups-${serviceId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'groups',
                    filter: `service_id=eq.${serviceId}`,
                },
                (payload) => {
                    log('RT: groups change detected', payload);
                    queryClient.invalidateQueries({ queryKey: ['groups', serviceId] });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'interns',
                    filter: `service_id=eq.${serviceId}`,
                },
                (payload) => {
                    log('RT: interns change detected', payload);
                    queryClient.invalidateQueries({ queryKey: ['groups', serviceId] });
                    queryClient.invalidateQueries({ queryKey: ['interns', serviceId] });
                }
            )
            .subscribe((status) => {
                log('RT: Subscription status', status);
            });

        return () => {
            log('useGroupsRealtime - Cleaning up subscription', serviceId);
            supabase.removeChannel(channel);
        };
    }, [serviceId, queryClient]);
}
