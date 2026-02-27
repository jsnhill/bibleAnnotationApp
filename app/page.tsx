'use client';

import { useState, useEffect } from 'react';
import Auth from '@/components/Auth';
import ReadingPage from '@/components/ReadingPage';
import AdminPanel from '@/components/AdminPanel';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated in session
    const storedUserId = sessionStorage.getItem('userId');
    const storedUserName = sessionStorage.getItem('userName');
    
    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
      setIsAuthenticated(true);
      
      // Check if admin (you can set this via environment variable or database)
      const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
      setIsAdmin(storedUserId === adminUserId);
    }
  }, []);

  const handleAuthenticated = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
    setIsAuthenticated(true);
    
    // Check if admin
    const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
    setIsAdmin(id === adminUserId);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserId('');
    setUserName('');
    setIsAdmin(false);
    setShowAdmin(false);
  };

  if (!isAuthenticated) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdmin(false)}
              className={`px-3 py-1 rounded ${
                !showAdmin ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Reading
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowAdmin(true)}
                className={`px-3 py-1 rounded ${
                  showAdmin ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Admin Panel
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      {showAdmin ? (
        <AdminPanel />
      ) : (
        <ReadingPage userId={userId} userName={userName} />
      )}
    </div>
  );
}
