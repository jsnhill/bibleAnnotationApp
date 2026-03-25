'use client';

import { useState, useEffect } from 'react';
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
  const [verses, setVerses] = useState<VerseWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<VerseWithComments | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    loadCurrentReading();
  }, []);

  const loadCurrentReading = async () => {
    setLoading(true);
    
    // Get current reading based on today's date
    const today = new Date().toISOString().split('T')[0];
    const { data: reading, error } = await supabase
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
    // Load verses from bible_verses table
    const { data: bibleVerses } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book_name', bookName)
      .eq('chapter', chapter)
      .order('verse');

    // Load all comments for this reading
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
      // Reload verses to show new comment
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

    if (!error) {
      setHasCompleted(true);
    }
  };

  const navigateReading = async (direction: 'prev' | 'next') => {
    if (!currentReading) return;

    const newIndex = direction === 'prev' 
      ? currentReading.order_index - 1 
      : currentReading.order_index + 1;

    const { data: reading } = await supabase
      .from('readings')
      .select('*')
      .eq('order_index', newIndex)
      .single();

    if (reading) {
      setCurrentReading(reading);
      await loadVerses(reading.id, reading.book_name, reading.chapter_number);
      await checkCompletion(reading.id);
    }
  };

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
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigateReading('prev')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Previous
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentReading.book_name} {currentReading.chapter_number}
            </h1>
            <button
              onClick={() => navigateReading('next')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Next →
            </button>
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
              <div className="text-center text-green-600 font-medium">
                ✓ You've marked this reading as complete
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
