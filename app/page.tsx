'use client';
import { useState, useEffect } from 'react';
import Auth from '@/components/Auth';
import ReadingPage from '@/components/ReadingPage';
import AdminPanel from '@/components/AdminPanel';
import ParticipantsModal from '@/components/ParticipantsModal';
import OnboardingModal from '@/components/OnboardingModal';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [currentReadingId, setCurrentReadingId] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Show onboarding modal automatically unless user has dismissed it permanently
  useEffect(() => {
    if (isAuthenticated) {
      const seen = localStorage.getItem('bibleapp_onboarding_seen');
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated]);

  const handleAuthenticated = (id: string, name: string, isAdmin: boolean) => {
    setUserId(id);
    setUserName(name);
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
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
            <button
              onClick={() => setShowParticipants(true)}
              className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
            >
              Participants
            </button>
            {/* Help / onboarding trigger */}
            <button
              onClick={() => setShowOnboarding(true)}
              title="How to annotate"
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-blue-100 text-gray-500 hover:text-blue-600 text-xs font-bold flex items-center justify-center transition"
              aria-label="How to annotate"
            >
              ?
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{userName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {showAdmin ? (
        <AdminPanel />
      ) : (
        <ReadingPage
          userId={userId}
          userName={userName}
          onReadingChange={setCurrentReadingId}
        />
      )}

      <ParticipantsModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        currentReadingId={currentReadingId}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
