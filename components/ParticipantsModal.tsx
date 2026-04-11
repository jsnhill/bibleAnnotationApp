'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Reading {
  id: string;
  book_name: string;
  chapter_number: number;
  start_date: string;
  end_date: string;
  order_index: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Completion {
  user_id: string;
  reading_id: string;
  completed_at: string;
}

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReadingId: string;
}

export default function ParticipantsModal({ isOpen, onClose, currentReadingId }: ParticipantsModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [lastActive, setLastActive] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const loadData = async () => {
    setLoading(true);

    const { data: usersData } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .order('first_name');

    const { data: readingsData } = await supabase
      .from('readings')
      .select('id, book_name, chapter_number, start_date, end_date, order_index')
      .order('order_index');

    const { data: completionsData } = await supabase
      .from('reading_completions')
      .select('user_id, reading_id, completed_at');

    const { data: commentsData } = await supabase
      .from('comments')
      .select('user_id, created_at')
      .order('created_at', { ascending: false });

    const lastActiveMap: Record<string, string> = {};

    if (commentsData) {
      commentsData.forEach((c: any) => {
        if (!lastActiveMap[c.user_id]) {
          lastActiveMap[c.user_id] = c.created_at;
        }
      });
    }

    if (completionsData) {
      completionsData.forEach((c: any) => {
        const existing = lastActiveMap[c.user_id];
        if (!existing || new Date(c.completed_at) > new Date(existing)) {
          lastActiveMap[c.user_id] = c.completed_at;
        }
      });
    }

    setUsers(usersData || []);
    setReadings(readingsData || []);
    setCompletions(completionsData || []);
    setLastActive(lastActiveMap);
    setLoading(false);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isCompleted = (userId: string, readingId: string): boolean => {
    return completions.some((c) => c.user_id === userId && c.reading_id === readingId);
  };

  const isCurrentReading = (readingId: string): boolean => {
    return readingId === currentReadingId;
  };

  const formatLastActive = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const formatReadingLabel = (reading: Reading): string => {
    return `${reading.book_name} ${reading.chapter_number}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Participants</h2>
            <p className="text-sm text-gray-500 mt-0.5">Reading completion across all sessions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-200"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Loading participants…
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            No participants found.
          </div>
        ) : (
          <div className="overflow-auto flex-1" ref={scrollRef}>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 min-w-[160px]">
                    Participant
                  </th>
                  {readings.map((reading) => (
                    <th
                      key={reading.id}
                      className={`border-b border-gray-200 px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[90px] ${
                        isCurrentReading(reading.id)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {formatReadingLabel(reading)}
                      {isCurrentReading(reading.id) && (
                        <span className="block text-xs font-normal text-blue-600 mt-0.5">Current</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, rowIdx) => (
                  <tr
                    key={user.id}
                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td
                      className={`sticky left-0 z-10 border-r border-gray-200 px-4 py-3 ${
                        rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{user.first_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatLastActive(lastActive[user.id])}
                      </div>
                    </td>
                    {readings.map((reading) => {
                      const done = isCompleted(user.id, reading.id);
                      const isCurrent = isCurrentReading(reading.id);
                      return (
                        <td
                          key={reading.id}
                          className={`border-b border-gray-100 px-3 py-3 text-center ${
                            isCurrent ? 'bg-blue-50' : ''
                          }`}
                        >
                          {done ? (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-green-100"
                              title="Completed"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-block w-4 h-4 rounded border border-gray-300 bg-white" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend footer */}
        <div className="flex items-center gap-6 px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-green-100">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            Completed
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-4 h-4 rounded border border-gray-300 bg-white" />
            Not yet completed
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-4 h-3 rounded bg-blue-100 border border-blue-200" />
            Current reading
          </div>
        </div>
      </div>
    </div>
  );
}
