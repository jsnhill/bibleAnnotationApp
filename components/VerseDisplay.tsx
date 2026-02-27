'use client';

import { VerseWithComments } from '@/lib/types';

interface VerseDisplayProps {
  verse: VerseWithComments;
  onClick: () => void;
}

export default function VerseDisplay({ verse, onClick }: VerseDisplayProps) {
  const hasComments = verse.allCommentCount > 0;
  const userCommented = verse.hasUserCommented;

  // Get unique user initials from comments
  const userInitials = Array.from(
    new Set(verse.comments.map((c) => c.user?.initials || ''))
  ).filter(Boolean);

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer p-4 rounded-lg transition
        ${hasComments ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
        ${userCommented ? 'border-l-4 border-blue-500' : ''}
      `}
    >
      <div className="flex gap-3">
        {/* Verse Number */}
        <span className="font-bold text-gray-500 flex-shrink-0 select-none">
          {verse.verse}
        </span>

        {/* Verse Text */}
        <div className="flex-1">
          <span className={userCommented ? 'italic text-gray-800' : 'text-gray-700'}>
            {verse.text}
          </span>

          {/* Comment Indicators */}
          {hasComments && (
            <span className="inline-flex items-center gap-2 ml-2">
              <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                💬 {verse.allCommentCount}
              </span>
              <span className="text-gray-600">
                ({userInitials.join(', ')})
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
