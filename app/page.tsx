'use client';
import { useState, useEffect } from 'react';
import Auth from '@/components/Auth';
import ReadingPage from '@/components/ReadingPage';
import AdminPanel from '@/components/AdminPanel';
import ParticipantsModal from '@/components/ParticipantsModal';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [currentReadingId, setCurrentReadingId] = useState('');

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    const storedUserName = sessionStorage.getItem('userName');
    const storedIsAdmin = sessionStorage.getItem('isAdmin');

    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
      setIsAuthenticated(true);
      setIsAdmin(storedIsAdmin === 'true');
    }
  }, []);

  const handleAuthenticated = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('isAdmin');
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
            <button
              onClick={() => setShowParticipants(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 100-4 2 2 0 000 4zM3 16a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
              Participants
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

      {showAdmin ? (
        <AdminPanel />
      ) : (
        <ReadingPage
          userId={userId}
          userName={userName}
          onReadingLoaded={setCurrentReadingId}
        />
      )}

      {showParticipants && (
        <ParticipantsModal
          currentReadingId={currentReadingId}
          onClose={() => setShowParticipants(false)}
        />
      )}
    </div>
  );
}
