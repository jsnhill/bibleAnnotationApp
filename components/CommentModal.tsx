'use client';

import { useState } from 'react';
import { VerseWithComments } from '@/lib/types';

interface CommentModalProps {
  verse: VerseWithComments;
  currentUserId: string;
  onClose: () => void;
  onSubmitComment: (verseNumber: number, commentText: string) => void;
}

export default function CommentModal({ 
  verse, 
  currentUserId, 
  onClose, 
  onSubmitComment 
}: CommentModalProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userHasCommented = verse.comments.some((c) => c.user_id === currentUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    await onSubmitComment(verse.verse, commentText);
    setCommentText('');
    setIsSubmitting(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Verse {verse.verse}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Verse Text */}
        <div className="p-4 bg-gray-50 border-b">
          <p className="text-gray-800 italic">
            <span className="font-bold text-gray-600">{verse.verse}</span> {verse.text}
          </p>
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto p-4">
          {verse.comments.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 mb-3">Comments:</h4>
              {verse.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg ${
                    comment.user_id === currentUserId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {comment.user?.first_name} {comment.user?.last_name}
                    </span>
                    <span className="text-gray-500">({comment.user?.initials})</span>
                    <span className="text-gray-400 text-sm">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>

        {/* Add Comment Form */}
        {!userHasCommented && (
          <div className="border-t p-4 bg-white">
            <form onSubmit={handleSubmit}>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Add your comment:
              </label>
              <textarea
                id="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="What resonates with you about this verse?"
                required
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {userHasCommented && (
          <div className="border-t p-4 bg-green-50">
            <p className="text-green-800 text-center">
              ✓ You've already commented on this verse
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
