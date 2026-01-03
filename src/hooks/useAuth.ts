import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { useUserStore } from '@/stores';
import { useToastStore } from '@/stores';

/**
 * Hook for authentication operations
 */
export function useAuth() {
    const queryClient = useQueryClient();
    const { setUser, setService, logout } = useUserStore();
    const { addToast } = useToastStore();

    // Sign Up
    const signUp = useMutation({
        mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
            console.log('[Auth] SignUp starting...', email);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            });
            if (error) throw error;
            return data;
        },
        onError: (error) => {
            addToast({ type: 'error', message: `Erreur d'inscription: ${error.message}` });
        }
    });

    // Sign In
    const signIn = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            console.log('[Auth] SignIn starting...', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // After sign in, fetch the associated intern profile
            const { data: intern, error: internError } = await supabase
                .from('interns')
                .select(`
          *,
          service:services(*)
        `)
                .eq('user_id', data.user.id)
                .single();

            if (internError && internError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('[Auth] Error fetching intern profile', internError);
            }

            return { auth: data, intern };
        },
        onSuccess: (data) => {
            if (data.intern) {
                setUser(data.intern);
                setService(data.intern.service);
            }
        },
        onError: (error) => {
            addToast({ type: 'error', message: `Erreur de connexion: ${error.message}` });
        }
    });

    // Sign Out
    const signOut = () => {
        console.log('[Auth] Signing out...');
        supabase.auth.signOut();
        logout();
        queryClient.clear();
        addToast({ type: 'info', message: 'Déconnecté' });
    };

    return {
        signUp,
        signIn,
        signOut,
    };
}
