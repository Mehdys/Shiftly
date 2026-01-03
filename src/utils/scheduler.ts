import type { Group, Assignment } from '@/types';

/**
 * Generate a fair round-robin schedule for on-call duties
 * Guarantees maximum 1 duty difference between any two groups
 */
export function generateSchedule(
    groups: Group[],
    startDate: string | Date,
    endDate: string | Date
): Omit<Assignment, 'id' | 'created_at'>[] {
    if (groups.length === 0) {
        throw new Error('At least one group is required');
    }

    const assignments: Omit<Assignment, 'id' | 'created_at'>[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Shuffle groups for randomized first assignment order
    const shuffledGroups = [...groups].sort(() => Math.random() - 0.5);

    let currentDate = new Date(start);
    let groupIndex = 0;

    while (currentDate <= end) {
        const group = shuffledGroups[groupIndex % shuffledGroups.length];

        assignments.push({
            service_id: group.service_id,
            group_id: group.id,
            date: currentDate.toISOString().split('T')[0],
        });

        currentDate.setDate(currentDate.getDate() + 1);
        groupIndex++;
    }

    return assignments;
}

/**
 * Calculate schedule statistics
 */
export function calculateScheduleStats(
    assignments: Assignment[],
    groups: Group[]
): { groupId: string; groupName: string; count: number }[] {
    const counts = new Map<string, number>();

    // Initialize counts
    for (const group of groups) {
        counts.set(group.id, 0);
    }

    // Count assignments
    for (const assignment of assignments) {
        counts.set(assignment.group_id, (counts.get(assignment.group_id) || 0) + 1);
    }

    // Build result with group names
    return groups.map((group) => ({
        groupId: group.id,
        groupName: `${group.emoji || ''} ${group.name}`.trim(),
        count: counts.get(group.id) || 0,
    }));
}

/**
 * Validate that schedule is fair (max 1 duty difference)
 */
export function isScheduleFair(assignments: Assignment[]): boolean {
    const counts = new Map<string, number>();

    for (const assignment of assignments) {
        counts.set(assignment.group_id, (counts.get(assignment.group_id) || 0) + 1);
    }

    const values = Array.from(counts.values());
    const min = Math.min(...values);
    const max = Math.max(...values);

    return max - min <= 1;
}
