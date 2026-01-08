
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">G</div>
              <span className="text-2xl font-bold text-indigo-600 hidden sm:block">GiveBound</span>
            </div>
            
            <nav className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => onNavigate('ai-assistant')} 
                className={`text-sm sm:text-base px-3 py-2 font-medium transition flex items-center gap-1 ${currentPage === 'ai-assistant' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden">✨</span>
              </button>
              
              {!user ? (
                <>
                  <button onClick={() => onNavigate('login')} className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 text-sm sm:text-base">Login</button>
                  <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm sm:text-base">Sign Up</button>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                  {user.role === UserRole.DONOR && (
                    <button 
                      onClick={() => onNavigate('post-donation')}
                      className="bg-indigo-600 text-white px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium hover:bg-indigo-700"
                    >
                      + Donate
                    </button>
                  )}

                  <button onClick={() => onNavigate('dashboard')} className="text-gray-600 hover:text-indigo-600 font-medium px-1 sm:px-2 py-2 text-sm">Dashboard</button>
                  <button onClick={handleLogoutWrapper} className="text-red-500 hover:text-red-700 font-medium px-1 sm:px-2 py-2 text-sm">Logout</button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GiveBound Platform. All rights reserved.</p>
          <p className="mt-2">Connecting compassion with need.</p>
        </div>
      </footer>
    </div>
  );

  function handleLogoutWrapper() {
    onLogout();
  }
};
