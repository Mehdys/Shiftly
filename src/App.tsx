import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/Toaster';
import { Welcome, Auth, CreateService, JoinService, Dashboard, GroupSelection, CreateGroup, Calendar } from '@/pages';
import { supabase } from '@/config/supabase';
import { useUserStore } from '@/stores/userStore';
import { useEffect } from 'react';
import React from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, isLoading } = useUserStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function App() {
    const { setSession, setIsLoading, setUser, setService } = useUserStore();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session) {
                    const { data: intern } = await supabase
                        .from('interns')
                        .select('*, service:services(*)')
                        .eq('user_id', session.user.id)
                        .single();
                    if (intern) {
                        setUser(intern);
                        setService(intern.service);
                    }
                }
            } catch (err) {
                console.error('[App] Initial session check error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Safety timeout: force loading to false after 5s if still stuck
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[App] Auth Event: ${event}`, session?.user?.email);
            setSession(session);

            if (session) {
                const { data: intern } = await supabase
                    .from('interns')
                    .select('*, service:services(*)')
                    .eq('user_id', session.user.id)
                    .single();

                if (intern) {
                    setUser(intern);
                    setService(intern.service);
                }
            } else {
                setUser(null);
                setService(null);
            }

            // Ensure loading is false after any auth state change processing
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);


    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Auth />} />

                    {/* Protected routes (require user session) */}
                    <Route path="/create" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
                    <Route path="/join" element={<ProtectedRoute><JoinService /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/groups" element={<ProtectedRoute><GroupSelection /></ProtectedRoute>} />
                    <Route path="/groups/create" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                </Routes>

                <Toaster />
            </div>
        </BrowserRouter>
    );
}

export default App;
