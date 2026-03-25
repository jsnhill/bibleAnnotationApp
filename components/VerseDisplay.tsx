'use client';

import { VerseWithComments } from '@/lib/types';
interface VerseDisplayProps {
  verse: VerseWithComments;
  onClick: () => void;
}
export default function VerseDisplay({ verse, onClick }: VerseDisplayProps) {
  const hasComments = verse.allCommentCount > 0;
  const userCommented = verse.hasUserCommented;
  const userInitials = Array.from(
    new Set(verse.comments.map((c) => c.user?.initials || ''))
  ).filter(Boolean);
  return (
    <span
      onClick={onClick}
      className={`
        cursor-pointer rounded transition leading-relaxed
        ${hasComments ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'}
        ${userCommented ? 'border-b-2 border-blue-400' : ''}
      `}
    >
      <sup className="font-bold text-gray-400 select-none mr-0.5 text-xs">
        {verse.verse}
      </sup>
      <span className={userCommented ? 'italic text-gray-800' : 'text-gray-700'}>
        {verse.text}
      </span>
      {hasComments && (
        <span className="inline-flex items-center gap-1 ml-1">
          <span className="text-blue-600 font-medium text-sm">💬{verse.allCommentCount}</span>
          <span className="text-gray-500 text-sm">({userInitials.join(', ')})</span>
        </span>
      )}
      {' '}
    </span>
  );
}
