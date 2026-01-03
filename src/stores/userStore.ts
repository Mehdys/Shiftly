import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Intern, Service } from '@/types';

interface UserState {
    // Current user (intern)
    currentUser: Intern | null;
    currentService: Service | null;
    session: any | null;
    isLoading: boolean;

    // Actions
    setUser: (user: Intern | null) => void;
    setService: (service: Service | null) => void;
    setSession: (session: any | null) => void;
    setIsLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            currentUser: null,
            currentService: null,
            session: null,
            isLoading: true,

            setUser: (user) => set({ currentUser: user }),
            setService: (service) => set({ currentService: service }),
            setSession: (session) => set({ session }),
            setIsLoading: (loading) => set({ isLoading: loading }),
            logout: () => set({
                currentUser: null,
                currentService: null,
                session: null
            }),
        }),
        {
            name: 'oncall-user-storage',
        }
    )
);
