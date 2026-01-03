import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Intern, Service } from '@/types';

interface UserState {
    // Current user (intern)
    currentUser: Intern | null;
    currentService: Service | null;

    // Actions
    setUser: (user: Intern | null) => void;
    setService: (service: Service | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            currentUser: null,
            currentService: null,

            setUser: (user) => set({ currentUser: user }),
            setService: (service) => set({ currentService: service }),
            logout: () => set({ currentUser: null, currentService: null }),
        }),
        {
            name: 'oncall-user-storage',
        }
    )
);
