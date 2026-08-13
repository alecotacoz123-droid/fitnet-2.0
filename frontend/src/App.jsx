import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Layout & Components
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';

// FitNet 2.0 Core Pages
import Dashboard from './pages/Dashboard';
import TrainHub from './pages/TrainHub';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';

// Sub-pages & Admin
import Groups from './pages/Groups';
import Progress from './pages/Progress';
import AdminPanel from './pages/AdminPanel';
import Onboarding from './pages/Onboarding';
import MyFitnessProfile from './pages/MyFitnessProfile';
import TrainingPlan from './pages/TrainingPlan';
import AITraining from './pages/AITraining';
import TrainingHistory from './pages/TrainingHistory';
import FitnessCalendar from './pages/FitnessCalendar';
import Survey from './pages/Survey';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Rutas públicas
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Rutas privadas (FitNet 2.0)
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 md:pl-64"> {/* padding bottom for mobile nav, padding left for desktop sidebar */}
        <Routes>
          {/* Los 5 Pilares */}
          <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/train" element={<TrainHub />} />
          <Route path="/community" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile username={user.username} />} />
          <Route path="/profile/:username" element={<Profile />} />

          {/* Sub-pantallas (mantienen funcionalidad pero navegables desde los pilares) */}
          <Route path="/groups" element={<Groups />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/my-profile" element={<MyFitnessProfile />} />
          <Route path="/training-plan" element={<TrainingPlan />} />
          <Route path="/ai-training" element={<AITraining />} />
          <Route path="/training-history" element={<TrainingHistory />} />
          <Route path="/calendar" element={<FitnessCalendar />} />
          
          {/* Admin */}
          {user.role === 'admin' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
