'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Reading, VerseWithComments, Comment, User } from '@/lib/types';
import VerseDisplay from './VerseDisplay';
import CommentModal from './CommentModal';

interface ReadingPageProps {
  userId: string;
  userName: string;
}

export default function ReadingPage({ userId, userName }: ReadingPageProps) {
  const [currentReading, setCurrentReading] = useState<Reading | null>(null);
  const [allReadings, setAllReadings] = useState<Reading[]>([]);
  const [verses, setVerses] = useState<VerseWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<VerseWithComments | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllReadings();
    loadCurrentReading();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllReadings = async () => {
    const { data } = await supabase
      .from('readings')
      .select('*')
      .order('order_index');
    if (data) setAllReadings(data);
  };

  const loadCurrentReading = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data: reading } = await supabase
      .from('readings')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .single();

    if (reading) {
      setCurrentReading(reading);
      await loadVerses(reading.id, reading.book_name, reading.chapter_number);
      await checkCompletion(reading.id);
    } else {
      setLoading(false);
    }
  };

  const loadVerses = async (readingId: string, bookName: string, chapter: number) => {
    const { data: bibleVerses } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book_name', bookName)
      .eq('chapter', chapter)
      .order('verse');

    const { data: comments } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('reading_id', readingId);

    if (bibleVerses) {
      const versesWithComments: VerseWithComments[] = bibleVerses.map((verse) => {
        const verseComments = (comments || []).filter(
          (c: any) => c.verse_number === verse.verse
        );
        const userComment = verseComments.find((c: any) => c.user_id === userId);
        return {
          ...verse,
          comments: verseComments,
          userCommentCount: userComment ? 1 : 0,
          allCommentCount: verseComments.length,
          hasUserCommented: !!userComment,
        };
      });
      setVerses(versesWithComments);
    }
    setLoading(false);
  };

  const checkCompletion = async (readingId: string) => {
    const { data } = await supabase
      .from('reading_completions')
      .select('*')
      .eq('reading_id', readingId)
      .eq('user_id', userId)
      .single();
    setHasCompleted(!!data);
  };

  const handleReadingSelect = async (reading: Reading) => {
    setShowDropdown(false);
    setCurrentReading(reading);
    setLoading(true);
    await loadVerses(reading.id, reading.book_name, reading.chapter_number);
    await checkCompletion(reading.id);
  };

  const handleVerseClick = (verse: VerseWithComments) => {
    setSelectedVerse(verse);
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async (verseNumber: number, commentText: string) => {
    if (!currentReading) return;
    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        reading_id: currentReading.id,
        verse_number: verseNumber,
        comment_text: commentText,
      });
    if (!error && currentReading) {
      await loadVerses(currentReading.id, currentReading.book_name, currentReading.chapter_number);
    }
    setShowCommentModal(false);
  };

  const handleMarkComplete = async () => {
    if (!currentReading) return;
    const { error } = await supabase
      .from('reading_completions')
      .insert({
        user_id: userId,
        reading_id: currentReading.id,
      });
    if (!error) setHasCompleted(true);
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentReading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Reading</h2>
          <p className="text-gray-600">Check back soon for the next reading assignment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center mb-2">
            {/* Reading Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-2xl font-bold text-gray-800 hover:text-blue-600 transition"
              >
                {currentReading.book_name} {currentReading.chapter_number}
                <span className="text-lg">▾</span>
              </button>
              {showDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-56 max-h-72 overflow-y-auto">
                  {allReadings.map((reading) => {
                    const isCurrent = reading.id === currentReading.id;
                    const isPast = reading.end_date < today;
                    const isFuture = reading.start_date > today;
                    return (
                      <button
                        key={reading.id}
                        onClick={() => handleReadingSelect(reading)}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition flex items-center justify-between gap-4
                          ${isCurrent ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'}
                        `}
                      >
                        <span>{reading.book_name} {reading.chapter_number}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {isPast ? '✓ past' : isFuture ? 'upcoming' : '● now'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600 text-center">
            Reading for {new Date(currentReading.start_date).toLocaleDateString()} - {new Date(currentReading.end_date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600 text-center mt-1">
            Logged in as: <span className="font-medium">{userName}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="leading-relaxed text-base">
            {verses.map((verse) => (
              <VerseDisplay
                key={verse.id}
                verse={verse}
                onClick={() => handleVerseClick(verse)}
              />
            ))}
          </p>

          {/* Complete Button */}
<div className="mt-8 pt-8 border-t">
  {hasCompleted ? (
    <div className="space-y-3">
      <div className="text-center text-green-600 font-medium">
        ✓ You've marked this reading as complete
      </div>
      {(() => {
        const currentIndex = allReadings.findIndex(r => r.id === currentReading.id);
        const nextReading = allReadings[currentIndex + 1];
        return nextReading ? (
          <button
            onClick={() => handleReadingSelect(nextReading)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Next Reading: {nextReading.book_name} {nextReading.chapter_number} →
          </button>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            You've reached the end of the reading plan!
          </div>
        );
      })()}
    </div>
  ) : (
    <button
      onClick={handleMarkComplete}
      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-medium"
    >
      Mark as Finished Reading
    </button>
  )}
</div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedVerse && (
        <CommentModal
          verse={selectedVerse}
          currentUserId={userId}
          onClose={() => setShowCommentModal(false)}
          onSubmitComment={handleCommentSubmit}
        />
      )}
    </div>
  );
}