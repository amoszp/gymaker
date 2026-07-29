import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WorkoutPage from '@/pages/WorkoutPage';
import CalendarPage from '@/pages/CalendarPage';
import MyDataPage from '@/pages/MyDataPage';
import SettingsPage from '@/pages/SettingsPage';
import Navigation, { DesktopSidebar } from '@/components/Navigation';

export default function App() {
  return (
    <Router>
      <div className="h-[100dvh] flex w-full text-white/90 overflow-hidden">
        <DesktopSidebar />
        <div className="flex-1 min-w-0 relative overflow-y-auto overscroll-contain pt-[env(safe-area-inset-top)] pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-12">
          <div className="max-w-none">
            <Routes>
              <Route path="/" element={<Navigate to="/workout" replace />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/data" element={<MyDataPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/workout" replace />} />
            </Routes>
          </div>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}
