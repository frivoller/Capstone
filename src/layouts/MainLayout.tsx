import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Props interface for the MainLayout component
 */
interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main Layout Component
 * Provides the common layout structure for all pages
 * Includes navigation, main content area, and footer
 * 
 * @param children - Content to be rendered in the main area
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation bar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Application title */}
            <div className="text-xl font-bold">Kütüphane Yönetim Sistemi</div>
            {/* Navigation links */}
            <div className="flex space-x-4">
              <NavLink to="/" className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
              }>
                Ana Sayfa
              </NavLink>
              <NavLink to="/books" className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
              }>
                Kitaplar
              </NavLink>
              <NavLink to="/authors" className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
              }>
                Yazarlar
              </NavLink>
              <NavLink to="/publishers" className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
              }>
                Yayınevleri
              </NavLink>
              <NavLink to="/categories" className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
              }>
                Kategoriler
              </NavLink>
              <NavLink to="/borrows" className={({ isActive }) => 
                isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
              }>
                Ödünç Alma
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      {/* Main content area */}
      <main className="container mx-auto p-4 mt-4 flex-grow">
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-gray-200 text-center p-4 mt-8 fixed bottom-0 w-full">
        <p>© 2025 Kütüphane Yönetim Sistemi</p>
      </footer>
    </div>
  );
};

export default MainLayout; 