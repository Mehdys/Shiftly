import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useUserStore, useToastStore } from '@/stores';
import { useCreateGroup, useMyJoinRequests } from '@/hooks';
import { ArrowLeft } from 'lucide-react';

const EMOJIS = ['🌟', '🌙', '⚡', '🔥', '💪', '🎯', '🚀', '💫', '🌈', '⭐', '🏥', '❤️'];

export default function CreateGroup() {
    const navigate = useNavigate();
    const { currentUser, currentService, setUser } = useUserStore();
    const { addToast } = useToastStore();
    const createGroupMutation = useCreateGroup();

    // Get user's pending requests
    const { data: myRequests = [] } = useMyJoinRequests(currentUser?.id);
    const hasPendingRequest = myRequests.some((r: any) => r.status === 'pending');

    const [formData, setFormData] = useState({
        name: '',
        emoji: '🌟',
        maxSize: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser || !currentService) {
            navigate('/');
            return;
        }

        if (hasPendingRequest) {
            addToast({ type: 'error', message: 'Annulez votre demande en attente avant de créer un groupe' });
            return;
        }

        if (currentUser.group_id) {
            addToast({ type: 'error', message: 'Vous appartenez déjà à un groupe' });
            return;
        }

        try {
            const group = await createGroupMutation.mutateAsync({
                serviceId: currentService.id,
                name: formData.name,
                emoji: formData.emoji,
                maxSize: formData.maxSize ? parseInt(formData.maxSize) : undefined,
                createdBy: currentUser.id,
            });

            // Update user's group
            setUser({ ...currentUser, group_id: group.id });

            addToast({ type: 'success', message: 'Groupe créé avec succès!' });
            navigate('/dashboard');
        } catch (error) {
            addToast({ type: 'error', message: 'Erreur lors de la création' });
        }
    };

    // Redirect if no session
    if (!currentUser || !currentService) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 safe-top">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/groups')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Créer un Groupe</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
                {/* Emoji Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choisissez un emoji
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                        {EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setFormData({ ...formData, emoji })}
                                className={`
                  w-12 h-12 text-2xl rounded-xl transition-all
                  ${formData.emoji === emoji
                                        ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                                        : 'bg-gray-100 hover:bg-gray-200'}
                `}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Group Name */}
                <Input
                    label="Nom du groupe"
                    placeholder="Ex: Équipe Alpha"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                {/* Max Size */}
                <Input
                    label="Taille maximum (optionnel)"
                    type="number"
                    placeholder="Ex: 5"
                    min="2"
                    max="20"
                    value={formData.maxSize}
                    onChange={(e) => setFormData({ ...formData, maxSize: e.target.value })}
                />

                {/* Preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aperçu
                    </label>
                    <Card>
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl">
                                {formData.emoji}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {formData.name || 'Nom du groupe'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {formData.maxSize ? `Max ${formData.maxSize} membres` : 'Taille illimitée'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={createGroupMutation.isPending}
                        disabled={!formData.name.trim()}
                    >
                        Créer le Groupe
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-3">
                        Vous serez automatiquement ajouté au groupe
                    </p>
                </div>
            </form>
        </div>
    );
}
