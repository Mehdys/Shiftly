import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine class names with Tailwind merge
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Generate a 6-character join code
export function generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Format date for display
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// Format date as relative (today, tomorrow, etc.)
export function formatRelativeDate(date: string | Date): string {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    if (diffDays === -1) return 'Hier';
    if (diffDays > 0 && diffDays <= 7) return `Dans ${diffDays} jours`;

    return formatDate(date);
}

// Calculate days between two dates
export function daysBetween(start: string | Date, end: string | Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get all dates in a range
export function getDatesInRange(start: string | Date, end: string | Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}
