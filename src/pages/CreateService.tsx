import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useToastStore, useUserStore } from '@/stores';
import { useCreateService } from '@/hooks';
import { ArrowLeft, Calendar, Copy, Check } from 'lucide-react';

export default function CreateService() {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const { setUser, setService } = useUserStore();
    const createServiceMutation = useCreateService();

    const [copied, setCopied] = useState(false);
    const [createdService, setCreatedService] = useState<{ name: string; joinCode: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        adminName: '',
        startDate: '',
        endDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await createServiceMutation.mutateAsync({
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate,
                adminName: formData.adminName,
            });

            setService(result.service);
            setUser(result.intern);
            setCreatedService({ name: result.service.name, joinCode: result.service.join_code });

            addToast({ type: 'success', message: 'Service créé avec succès!' });
        } catch (error) {
            addToast({ type: 'error', message: 'Erreur lors de la création' });
        }
    };

    const copyCode = async () => {
        if (createdService) {
            await navigator.clipboard.writeText(createdService.joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Success screen after creation
    if (createdService) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Service Créé!
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Partagez ce code avec les internes
                    </p>

                    <Card className="w-full max-w-sm">
                        <CardContent className="text-center py-6">
                            <p className="text-sm text-gray-500 mb-2">Code d'accès</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-mono font-bold tracking-widest text-primary-600">
                                    {createdService.joinCode}
                                </span>
                                <button
                                    onClick={copyCode}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="px-6 pb-8 safe-bottom">
                    <Button fullWidth size="lg" onClick={() => navigate('/dashboard')}>
                        Continuer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Créer un Service</h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
                <Input
                    label="Nom du service"
                    placeholder="Ex: Cardiologie Janvier-Mars"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    icon={<Calendar className="w-5 h-5" />}
                    required
                />

                <Input
                    label="Votre nom"
                    placeholder="Dr. Dupont"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Date de début"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />
                    <Input
                        label="Date de fin"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                    />
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={createServiceMutation.isPending}
                        disabled={!formData.name || !formData.adminName || !formData.startDate || !formData.endDate}
                    >
                        Créer le Service
                    </Button>
                </div>
            </form>
        </div>
    );
}
