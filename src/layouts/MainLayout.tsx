import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { to: '/books', label: 'Books' },
  { to: '/authors', label: 'Author' },
  { to: '/publishers', label: 'Publisher' },
  { to: '/categories', label: 'Category' },
  { to: '/borrows', label: 'Borrow' },
];

const MainLayout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-white tracking-wide">Library App</Link>
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-white px-2 py-1 rounded transition-colors duration-200 ${location.pathname.startsWith(item.to) ? 'bg-gray-800 font-semibold' : 'hover:bg-gray-800'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto py-8 px-4">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout; 