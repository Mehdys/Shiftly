import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button } from '@/components/ui';
import { useUserStore } from '@/stores';
import { useAssignments } from '@/hooks';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Calendar() {
    const navigate = useNavigate();
    const { currentUser, currentService } = useUserStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Fetch all assignments from Supabase
    const { data: assignments = [], isLoading } = useAssignments(currentService?.id);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Adjust for Monday start
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const days: (Date | null)[] = [];

        // Add empty slots for days before first
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        // Add all days of month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    }, [currentMonth]);

    const getAssignment = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return assignments.find((a) => a.date === dateStr);
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Selected day detail
    const selectedAssignment = selectedDate
        ? assignments.find(a => a.date === selectedDate)
        : null;

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
                        onClick={() => navigate('/dashboard')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Calendrier</h1>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-4">
                <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-lg">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Calendar Grid */}
                    <div className="px-4">
                        <Card>
                            <CardContent className="p-4">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {DAYS.map((day) => (
                                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((date, i) => {
                                        if (!date) {
                                            return <div key={`empty-${i}`} className="aspect-square" />;
                                        }

                                        const assignment = getAssignment(date);
                                        const isToday = date.getTime() === today.getTime();
                                        const dateStr = date.toISOString().split('T')[0];
                                        const isSelected = selectedDate === dateStr;
                                        const isMyGroup = assignment?.group?.id === currentUser.group_id;

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={`
                          aspect-square rounded-xl text-sm font-medium transition-all
                          flex flex-col items-center justify-center gap-0.5
                          ${isToday ? 'ring-2 ring-primary-500' : ''}
                          ${isSelected ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}
                          ${assignment && !isSelected ? (isMyGroup ? 'bg-green-100' : 'bg-primary-50') : ''}
                        `}
                                            >
                                                <span>{date.getDate()}</span>
                                                {assignment && (
                                                    <span className="text-xs">{assignment.group?.emoji}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selected Day Detail */}
                    {selectedDate && (
                        <div className="px-4 mt-4">
                            <Card>
                                <CardContent className="py-4">
                                    <p className="text-sm text-gray-500 mb-2">
                                        {formatDate(selectedDate)}
                                    </p>
                                    {selectedAssignment ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl">
                                                {selectedAssignment.group?.emoji || '👥'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{selectedAssignment.group?.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {selectedAssignment.group?.id === currentUser.group_id
                                                        ? 'Votre groupe est de garde'
                                                        : 'De garde ce jour'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Aucune garde assignée</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="px-4 mt-6 pb-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-primary-50 ring-2 ring-primary-500" />
                                <span>Aujourd'hui</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-100" />
                                <span>Ma garde</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-primary-50" />
                                <span>Autre garde</span>
                            </div>
                        </div>
                    </div>

                    {/* No Schedule Message */}
                    {assignments.length === 0 && (
                        <div className="px-4 mt-4">
                            <Card>
                                <CardContent className="text-center py-8">
                                    <p className="text-gray-500 mb-4">
                                        Le planning n'a pas encore été généré
                                    </p>
                                    {currentUser.is_admin && (
                                        <Button variant="outline" onClick={() => navigate('/groups')}>
                                            Gérer les groupes
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
