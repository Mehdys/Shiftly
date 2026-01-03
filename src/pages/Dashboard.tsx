import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { useUserStore } from '@/stores';
import { useTodayAssignment, useGroups } from '@/hooks';
import { Calendar, Users, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const { currentUser, currentService, logout } = useUserStore();

    // Fetch today's assignment
    const { data: todayAssignment, isLoading: loadingAssignment } = useTodayAssignment(currentService?.id);

    // Fetch groups to find user's group
    const { data: groups = [] } = useGroups(currentService?.id);
    const myGroup = groups.find(g => g.id === currentUser?.group_id);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Redirect if no session
    if (!currentUser || !currentService) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-sm">
                    <CardContent className="text-center py-8">
                        <h2 className="text-lg font-semibold mb-4">Session expirée</h2>
                        <Button onClick={() => navigate('/')} fullWidth>
                            Retour à l'accueil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 pt-6 pb-8 safe-top">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-primary-200 text-sm">Bonjour,</p>
                        <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5 text-white/80" />
                    </button>
                </div>

                {/* Today Card */}
                <Card className="mx-0">
                    <CardContent className="py-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aujourd'hui</p>
                        {loadingAssignment ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Chargement...
                            </div>
                        ) : todayAssignment ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {todayAssignment.group.emoji} {todayAssignment.group.name}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {todayAssignment.group.id === currentUser.group_id
                                            ? 'Votre groupe est de garde'
                                            : 'Groupe de garde'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary-600" />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {myGroup ? `${myGroup.emoji} ${myGroup.name}` : 'Pas de groupe'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {myGroup ? 'Pas de garde aujourd\'hui' : 'Rejoignez un groupe'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="px-4 -mt-2 space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide pt-4">
                    Actions Rapides
                </h3>

                <Card hoverable onClick={() => navigate('/groups')}>
                    <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Groupes</h4>
                            <p className="text-sm text-gray-500">
                                {currentUser.group_id ? 'Voir votre groupe' : 'Créer ou rejoindre un groupe'}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </CardContent>
                </Card>

                <Card hoverable onClick={() => navigate('/calendar')}>
                    <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Calendrier</h4>
                            <p className="text-sm text-gray-500">Voir le planning des gardes</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </CardContent>
                </Card>
            </div>

            {/* Service Info */}
            <div className="px-4 mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Informations du Service
                </h3>
                <Card>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Service</span>
                            <span className="font-medium">{currentService.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Période</span>
                            <span className="font-medium">
                                {formatDate(currentService.start_date)} - {formatDate(currentService.end_date)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Code</span>
                            <span className="font-mono text-primary-600 font-bold">
                                {currentService.join_code}
                            </span>
                        </div>
                        {myGroup && (
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                                <span className="text-gray-500">Mon groupe</span>
                                <span className="font-medium">
                                    {myGroup.emoji} {myGroup.name}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
