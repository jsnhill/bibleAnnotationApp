'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Reading } from '@/lib/types';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah',
  'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
  'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

interface SchedulePreviewItem {
  chapter: number;
  startDate: string;
  endDate: string;
}

export default function AdminPanel() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [bookName, setBookName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [pace, setPace] = useState<'weekly' | 'daily'>('weekly');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<SchedulePreviewItem[]>([]);
  const [chapterCount, setChapterCount] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    const { data } = await supabase
      .from('readings')
      .select('*')
      .order('order_index');
    if (data) setReadings(data);
  };

  const getChapterCount = async (book: string): Promise<number> => {
    const { data } = await supabase
      .from('bible_verses')
      .select('chapter')
      .eq('book_name', book)
      .order('chapter', { ascending: false })
      .limit(1);
    return data && data.length > 0 ? data[0].chapter : 0;
  };

  const handleGeneratePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName || !startDate) return;
    setLoading(true);
    setMessage('');

    const count = await getChapterCount(bookName);
    if (count === 0) {
      setMessage('Could not find chapters for this book. Please try again.');
      setLoading(false);
      return;
    }

    setChapterCount(count);
    const daysPerChapter = pace === 'weekly' ? 7 : 1;
    const items: SchedulePreviewItem[] = [];
    let current = new Date(startDate + 'T00:00:00');

    for (let ch = 1; ch <= count; ch++) {
      const chStart = new Date(current);
      const chEnd = new Date(current);
      chEnd.setDate(chEnd.getDate() + daysPerChapter - 1);
      items.push({
        chapter: ch,
        startDate: chStart.toISOString().split('T')[0],
        endDate: chEnd.toISOString().split('T')[0],
      });
      current.setDate(current.getDate() + daysPerChapter);
    }

    setPreview(items);
    setShowPreview(true);
    setLoading(false);
  };

  const handleConfirmSchedule = async () => {
    setConfirming(true);
    setMessage('');

    // Delete all existing readings
    const { error: deleteError } = await supabase
      .from('readings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      setMessage('Error clearing existing readings. Please try again.');
      setConfirming(false);
      return;
    }

    // Insert new readings
    const newReadings = preview.map((item, index) => ({
      book_name: bookName,
      chapter_number: item.chapter,
      start_date: item.startDate,
      end_date: item.endDate,
      order_index: index + 1,
    }));

    const { error: insertError } = await supabase
      .from('readings')
      .insert(newReadings);

    setConfirming(false);

    if (insertError) {
      setMessage('Error saving schedule. Please try again.');
    } else {
      setMessage(`Successfully scheduled ${preview.length} readings for ${bookName}!`);
      setShowPreview(false);
      setPreview([]);
      setBookName('');
      setStartDate('');
      loadReadings();
    }

    setTimeout(() => setMessage(''), 5000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading?')) return;
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id);
    if (!error) loadReadings();
  };

  const getUserCompletions = async (readingId: string) => {
    const { data } = await supabase
      .from('reading_completions')
      .select(`*, user:users(first_name, last_name)`)
      .eq('reading_id', readingId);
    if (data) {
      const users = data.map((c: any) => `${c.user.first_name} ${c.user.last_name}`);
      alert(`Completed by:\n${users.join('\n') || 'No one yet'}`);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        {/* Schedule New Reading Plan */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule New Reading Plan</h2>
          <form onSubmit={handleGeneratePreview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Book</label>
              <select
                value={bookName}
                onChange={(e) => { setBookName(e.target.value); setShowPreview(false); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a book...</option>
                {BIBLE_BOOKS.map((book) => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setShowPreview(false); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reading Pace</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pace"
                    value="weekly"
                    checked={pace === 'weekly'}
                    onChange={() => { setPace('weekly'); setShowPreview(false); }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">One Chapter per Week</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pace"
                    value="daily"
                    checked={pace === 'daily'}
                    onChange={() => { setPace('daily'); setShowPreview(false); }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">One Chapter per Day</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating Preview...' : 'Preview Schedule'}
              </button>
            </div>

            {message && (
              <div className={`md:col-span-2 p-3 rounded-lg ${
                message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
              }`}>
                {message}
              </div>
            )}
          </form>

          {/* Preview */}
          {showPreview && preview.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Schedule Preview — {bookName} ({preview.length} chapters, {pace === 'weekly' ? 'one per week' : 'one per day'})
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <div className="max-h-64 overflow-y-auto">
                  {preview.map((item) => (
                    <div
                      key={item.chapter}
                      className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-800">{bookName} {item.chapter}</span>
                      <span className="text-sm text-gray-500">{formatDate(item.startDate)} — {formatDate(item.endDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 font-medium">
                  ⚠️ This will replace your entire existing reading plan with {preview.length} new readings. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleConfirmSchedule}
                disabled={confirming}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {confirming ? 'Saving...' : `Confirm — Schedule ${bookName}`}
              </button>
            </div>
          )}
        </div>

        {/* Scheduled Readings List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scheduled Readings</h2>
          <div className="space-y-3">
            {readings.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {reading.book_name} {reading.chapter_number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(reading.start_date)} - {formatDate(reading.end_date)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => getUserCompletions(reading.id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                  >
                    View Completions
                  </button>
                  <button
                    onClick={() => handleDelete(reading.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {readings.length === 0 && (
              <p className="text-gray-500 text-center py-8">No readings scheduled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
