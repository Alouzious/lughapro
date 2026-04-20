import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-gray-100 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LughaPro. Professional Kiswahili learning.
        </div>
      </footer>
    </div>
  );
}
