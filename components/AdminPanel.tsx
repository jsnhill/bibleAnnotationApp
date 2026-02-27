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

export default function AdminPanel() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [bookName, setBookName] = useState('');
  const [chapter, setChapter] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    const { data } = await supabase
      .from('readings')
      .select('*')
      .order('order_index');

    if (data) {
      setReadings(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Get next order index
    const maxOrder = readings.length > 0 
      ? Math.max(...readings.map(r => r.order_index))
      : 0;

    const { error } = await supabase
      .from('readings')
      .insert({
        book_name: bookName,
        chapter_number: parseInt(chapter),
        start_date: startDate,
        end_date: endDate,
        order_index: maxOrder + 1,
      });

    setLoading(false);

    if (error) {
      setMessage('Error creating reading. Please try again.');
    } else {
      setMessage('Reading scheduled successfully!');
      setBookName('');
      setChapter('1');
      setStartDate('');
      setEndDate('');
      loadReadings();
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading?')) return;

    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id);

    if (!error) {
      loadReadings();
    }
  };

  const getUserCompletions = async (readingId: string) => {
    const { data } = await supabase
      .from('reading_completions')
      .select(`
        *,
        user:users(first_name, last_name)
      `)
      .eq('reading_id', readingId);

    if (data) {
      const users = data.map((c: any) => `${c.user.first_name} ${c.user.last_name}`);
      alert(`Completed by:\n${users.join('\n') || 'No one yet'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        {/* Schedule New Reading */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule New Reading</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book
              </label>
              <select
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a book...</option>
                {BIBLE_BOOKS.map((book) => (
                  <option key={book} value={book}>
                    {book}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter
              </label>
              <input
                type="number"
                min="1"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Reading'}
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
                    {new Date(reading.start_date).toLocaleDateString()} - {new Date(reading.end_date).toLocaleDateString()}
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
