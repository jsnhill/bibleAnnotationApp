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
