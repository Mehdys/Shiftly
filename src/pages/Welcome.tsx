import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Calendar, Users, Sparkles } from 'lucide-react';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mb-6 mx-auto">
                        <Calendar className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Shiftly
                    </h1>
                    <p className="text-primary-100 text-lg max-w-xs mx-auto">
                        Planification équitable des gardes pour les internes
                    </p>
                </div>

                {/* Features */}
                <div className="grid gap-4 mb-10 w-full max-w-sm">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-white">Formation de groupes</h3>
                            <p className="text-sm text-primary-200">Créez et rejoignez des équipes</p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-white">Distribution équitable</h3>
                            <p className="text-sm text-primary-200">Algorithme de répartition juste</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-8 safe-bottom space-y-3">
                <Button
                    fullWidth
                    size="lg"
                    className="bg-white text-primary-700 hover:bg-primary-50"
                    onClick={() => navigate('/create')}
                >
                    Créer un Service
                </Button>
                <Button
                    fullWidth
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => navigate('/join')}
                >
                    Rejoindre un Service
                </Button>
            </div>
        </div>
    );
}
