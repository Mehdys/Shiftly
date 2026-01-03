import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useUserStore, useToastStore } from '@/stores';
import { useGroups, useRequestToJoin, useMyJoinRequests, useGroupsRealtime, useManagedRequests, useRespondToRequest } from '@/hooks';
import { ArrowLeft, Plus, Users, Search, Clock, ChevronRight, Loader2, Check, X, ShieldAlert } from 'lucide-react';

export default function GroupSelection() {
    const navigate = useNavigate();
    const { currentUser, currentService } = useUserStore();
    const { addToast } = useToastStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch groups from Supabase
    const { data: groups = [], isLoading: loadingGroups } = useGroups(currentService?.id);

    // Subscribe to realtime updates
    useGroupsRealtime(currentService?.id);

    // Get user's pending requests
    const { data: myRequests = [], isLoading: loadingMyRequests } = useMyJoinRequests(currentUser?.id);

    // Get requests for groups I created
    const { data: managedRequests = [] } = useManagedRequests(currentUser?.id);

    const requestToJoinMutation = useRequestToJoin();
    const respondMutation = useRespondToRequest();

    const hasPendingRequest = myRequests.some(r => r.status === 'pending');

    const filteredGroups = groups.filter(
        (g) => g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRequestJoin = async (groupId: string) => {
        if (!currentUser) return;

        if (hasPendingRequest) {
            addToast({ type: 'error', message: 'Vous avez déjà une demande en attente' });
            return;
        }

        if (currentUser.group_id) {
            addToast({ type: 'error', message: 'Vous appartenez déjà à un groupe' });
            return;
        }

        try {
            await requestToJoinMutation.mutateAsync({
                groupId,
                internId: currentUser.id,
            });
            addToast({ type: 'info', message: 'Demande envoyée!' });
        } catch (error) {
            addToast({ type: 'error', message: 'Erreur lors de l\'envoi' });
        }
    };

    const handleResponse = async (requestId: string, approved: boolean, internId: string, groupId: string) => {
        try {
            await respondMutation.mutateAsync({
                requestId,
                approved,
                internId,
                groupId
            });
            addToast({
                type: approved ? 'success' : 'info',
                message: approved ? 'Demande acceptée!' : 'Demande refusée'
            });
        } catch (error) {
            addToast({ type: 'error', message: 'Erreur lors de la réponse' });
        }
    };

    // Redirect if no session
    if (!currentUser || !currentService) {
        navigate('/');
        return null;
    }

    const isLoading = loadingGroups || loadingMyRequests;

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 safe-top sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Groupes</h1>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => navigate('/groups/create')}
                        disabled={hasPendingRequest}
                        title={hasPendingRequest ? "Annulez votre demande en attente pour créer un groupe" : ""}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Créer
                    </Button>
                </div>

                {/* Search */}
                <Input
                    placeholder="Rechercher un groupe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                />
            </div>

            <div className="px-4 py-4 space-y-6">
                {/* Managed Requests Section (For Creators) */}
                {managedRequests.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            Demandes à valider
                        </h2>
                        <div className="space-y-2">
                            {managedRequests.map((request) => (
                                <Card key={request.id} className="border-l-4 border-l-primary-500">
                                    <CardContent className="py-3 px-4">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {request.intern.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    veut rejoindre <span className="text-primary-600 font-medium">{request.group.name}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleResponse(request.id, false, request.intern_id, request.group_id)}
                                                    disabled={respondMutation.isPending}
                                                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleResponse(request.id, true, request.intern_id, request.group_id)}
                                                    disabled={respondMutation.isPending}
                                                    className="p-2 hover:bg-green-50 text-green-500 rounded-full transition-colors"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Pending Request Alert */}
                {hasPendingRequest && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold">Demande en cours</p>
                            <p className="opacity-80">Vous ne pouvez pas créer de groupe tant que votre demande est en attente.</p>
                        </div>
                    </div>
                )}

                {/* Groups List */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Tous les groupes
                    </h2>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Aucun groupe trouvé</p>
                            {!hasPendingRequest && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => navigate('/groups/create')}
                                >
                                    Créer le premier groupe
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredGroups.map((group) => {
                            const myRequest = myRequests.find(r => r.group_id === group.id && r.status === 'pending');
                            const isPending = !!myRequest;
                            const isFull = group.max_size ? group.member_count >= group.max_size : false;
                            const isMyGroup = currentUser.group_id === group.id;

                            return (
                                <Card key={group.id} hoverable>
                                    <CardContent className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl">
                                                {group.emoji || '👥'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {group.name}
                                                    </h3>
                                                    {isMyGroup && (
                                                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                                            Mon groupe
                                                        </span>
                                                    )}
                                                    {!group.is_open && (
                                                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                                                            Fermé
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                    <Users className="w-4 h-4" />
                                                    {group.member_count}/{group.max_size || '∞'} membres
                                                </p>
                                            </div>

                                            {isMyGroup ? (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            ) : isPending ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                        <Clock className="w-3 h-3" />
                                                        En attente
                                                    </span>
                                                </div>
                                            ) : (group.is_open && !isFull) ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    loading={requestToJoinMutation.isPending && requestToJoinMutation.variables?.groupId === group.id}
                                                    disabled={hasPendingRequest || !!currentUser.group_id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRequestJoin(group.id);
                                                    }}
                                                >
                                                    Rejoindre
                                                </Button>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                    {isFull ? 'Complet' : 'Privé'}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </section>
            </div>
        </div>
    );
}
