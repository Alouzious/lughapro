import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorListing from './pages/TutorListing';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfilePage from './pages/TutorProfilePage';
import BookingForm from './pages/BookingForm';
import RatingForm from './pages/RatingForm';
import AdminDashboard from './pages/AdminDashboard';
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
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
