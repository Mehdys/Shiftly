import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useToastStore, useUserStore } from '@/stores';
import { useJoinService, useService } from '@/hooks';
import { ArrowLeft, Hash, Loader2 } from 'lucide-react';

export default function JoinService() {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const { setUser, setService } = useUserStore();

    const [step, setStep] = useState<1 | 2>(1);
    const [joinCode, setJoinCode] = useState('');
    const [name, setName] = useState('');

    // Verify code before proceeding
    const { data: serviceData, isLoading: isVerifying, error: verifyError } = useService(
        step === 1 && joinCode.length === 6 ? joinCode : undefined
    );

    const joinServiceMutation = useJoinService();

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (serviceData) {
            setStep(2);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await joinServiceMutation.mutateAsync({
                joinCode: joinCode,
                name: name,
            });

            setService(result.service);
            setUser(result.intern);

            addToast({ type: 'success', message: 'Bienvenue!' });
            navigate('/groups');
        } catch (error) {
            addToast({ type: 'error', message: 'Erreur lors de la connexion' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => step === 1 ? navigate('/') : setStep(1)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">
                        {step === 1 ? 'Rejoindre un Service' : 'Vos Informations'}
                    </h1>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-4 py-6">
                {step === 1 ? (
                    <form onSubmit={handleCodeSubmit} className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <p className="text-gray-600 mb-6">
                                Entrez le code à 6 caractères fourni par l'administrateur du service.
                            </p>

                            <Input
                                label="Code d'accès"
                                placeholder="ABC123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                                icon={<Hash className="w-5 h-5" />}
                                className="text-center text-2xl font-mono tracking-widest"
                                maxLength={6}
                                autoFocus
                            />

                            <div className="mt-3 text-sm text-center">
                                {isVerifying ? (
                                    <span className="text-gray-500 flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Vérification...
                                    </span>
                                ) : serviceData ? (
                                    <span className="text-green-600">
                                        ✓ Service trouvé: {serviceData.name}
                                    </span>
                                ) : joinCode.length === 6 && !isVerifying ? (
                                    <span className="text-red-600">
                                        Code invalide
                                    </span>
                                ) : (
                                    <span className="text-gray-500">
                                        {joinCode.length}/6 caractères
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={!serviceData}
                        >
                            Continuer
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleJoin} className="flex-1 flex flex-col">
                        <div className="flex-1">
                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
                                <p className="text-sm text-primary-700">
                                    Service: <span className="font-bold">{serviceData?.name}</span>
                                </p>
                                <p className="text-xs text-primary-600 mt-1">
                                    Code: <span className="font-mono">{joinCode}</span>
                                </p>
                            </div>

                            <Input
                                label="Votre nom complet"
                                placeholder="Dr. Martin"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />

                            <p className="mt-3 text-sm text-gray-500">
                                Ce nom sera visible par les autres internes du service.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={joinServiceMutation.isPending}
                            disabled={!name.trim()}
                        >
                            Rejoindre le Service
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
