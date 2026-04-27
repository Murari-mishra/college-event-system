import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => (
  <div className="min-h-screen bg-surface-50">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Outlet />
    </main>
  </div>
);
