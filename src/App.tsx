import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/Toaster';
import Welcome from '@/pages/Welcome';
import CreateService from '@/pages/CreateService';
import JoinService from '@/pages/JoinService';
import Dashboard from '@/pages/Dashboard';
import GroupSelection from '@/pages/GroupSelection';
import CreateGroup from '@/pages/CreateGroup';
import Calendar from '@/pages/Calendar';
import { useUserStore } from '@/stores/userStore';

function App() {
    const { currentUser } = useUserStore();

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Welcome />} />
                    <Route path="/create" element={<CreateService />} />
                    <Route path="/join" element={<JoinService />} />

                    {/* Protected routes (require user session) */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/groups" element={<GroupSelection />} />
                    <Route path="/groups/create" element={<CreateGroup />} />
                    <Route path="/calendar" element={<Calendar />} />
                </Routes>

                <Toaster />
            </div>
        </BrowserRouter>
    );
}

export default App;
