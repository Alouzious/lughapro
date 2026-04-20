import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorListing from './pages/TutorListing';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

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
    path: '/student',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <StudentDashboard /> },
    ],
  },
  {
    path: '/tutor',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <TutorDashboard /> },
    ],
  },
  {
    path: '/admin',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
