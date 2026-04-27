import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';

// Public
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageEventsPage } from './pages/admin/ManageEventsPage';
import { CreateEventPage } from './pages/admin/CreateEventPage';
import { ViewParticipantsPage } from './pages/admin/ViewParticipantsPage';
import { QRScannerPage } from './pages/admin/QRScannerPage';

// Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { EventListPage } from './pages/student/EventListPage';
import { MyRegistrationsPage } from './pages/student/MyRegistrationsPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { CalendarPage } from './pages/student/CalendarPage';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<ManageEventsPage />} />
              <Route path="/admin/create-event" element={<CreateEventPage />} />
              <Route path="/admin/participants/:eventId" element={<ViewParticipantsPage />} />
              <Route path="/admin/scanner" element={<QRScannerPage />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<Layout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/events" element={<EventListPage />} />
              <Route path="/student/my-registrations" element={<MyRegistrationsPage />} />
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/calendar" element={<CalendarPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
