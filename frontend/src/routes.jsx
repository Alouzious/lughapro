import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorListing from './pages/TutorListing';
import StudentDashboard from './pages/StudentDashboard';
import StudentBookings from './pages/StudentBookings';
import StudentProfile from './pages/StudentProfile';
import StudentSettings from './pages/StudentSettings';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfilePage from './pages/TutorProfilePage';
import TutorSessions from './pages/TutorSessions';
import TutorEarnings from './pages/TutorEarnings';
import TutorFellowTutors from './pages/TutorFellowTutors';
import TutorSettings from './pages/TutorSettings';
import BookingForm from './pages/BookingForm';
import RatingForm from './pages/RatingForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTutors from './pages/AdminTutors';
import AdminStudents from './pages/AdminStudents';
import AdminBookings from './pages/AdminBookings';
import AdminPayments from './pages/AdminPayments';
import AdminDisputes from './pages/AdminDisputes';
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'tutors', element: <TutorListing /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/book/:tutorId',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <BookingForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/rate/:bookingId',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <RatingForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'bookings', element: <StudentBookings /> },
      { path: 'profile', element: <StudentProfile /> },
      { path: 'settings', element: <StudentSettings /> },
    ],
  },
  {
    path: '/tutor',
    element: (
      <ProtectedRoute allowedRoles={['tutor']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <TutorDashboard /> },
      { path: 'profile', element: <TutorProfilePage /> },
      { path: 'sessions', element: <TutorSessions /> },
      { path: 'earnings', element: <TutorEarnings /> },
      { path: 'fellow-tutors', element: <TutorFellowTutors /> },
      { path: 'settings', element: <TutorSettings /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'tutors', element: <AdminTutors /> },
      { path: 'students', element: <AdminStudents /> },
      { path: 'bookings', element: <AdminBookings /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'disputes', element: <AdminDisputes /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
