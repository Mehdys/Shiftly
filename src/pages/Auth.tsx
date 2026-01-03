import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserPlus, Stethoscope, Loader2 } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const result = await signIn.mutateAsync({ email, password });
                if (result.intern) {
                    navigate('/dashboard');
                } else {
                    navigate('/'); // Redirect to welcome if no intern profile yet
                }
            } else {
                await signUp.mutateAsync({ email, password, name });
                // After signup Supabase usually signs in automatically or requires email verification
                // For now, let's switch to login or wait for auto-sign in
                setIsLogin(true);
            }
        } catch (err) {
            console.error('[Auth] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Shiftly</h1>
                    <p className="text-primary-100 italic">Planification médicale intelligente</p>
                </div>

                <Card className="border-none shadow-2xl overflow-hidden">
                    <div className="bg-white p-1">
                        <div className="flex">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${isLogin ? 'text-primary-600 bg-primary-50 rounded-lg' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isLogin ? 'text-primary-600 bg-primary-50 rounded-lg' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Inscription
                            </button>
                        </div>
                    </div>

                    <CardContent className="p-8 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Nom Complet</label>
                                    <Input
                                        placeholder="Dr. Jean Dupont"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Email Professionnel</label>
                                <Input
                                    type="email"
                                    placeholder="jean.dupont@hopital.fr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                disabled={loading}
                                className="mt-6"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isLogin ? (
                                    <>
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Se connecter
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5 mr-2" />
                                        Créer mon compte
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-primary-100 text-sm">
                    {isLogin
                        ? "Première fois ? Créez un compte pour rejoindre votre service."
                        : "Déjà inscrit ? Connectez-vous pour voir votre planning."
                    }
                </p>
            </div>
        </div>
    );
}
