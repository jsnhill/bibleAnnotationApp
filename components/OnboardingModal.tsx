'use client';
import { useState, useEffect } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('bibleapp_onboarding_seen', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10">
        {/* X button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src="/logo.svg" alt="App logo" className="h-16 w-auto" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
          Welcome to Our Reading Group
        </h2>

        {/* Warm intro */}
        <p className="text-gray-600 text-sm text-center mb-5 leading-relaxed">
          This is a space for you to read scripture together with your life group and share what
          stands out to you — a question, a thought, or even a prayer. Your notes will be viewable
          by everyone in your life group to help us all go deeper into the Word and our relationship
          with each other.
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-5 space-y-3">
          <p className="text-sm font-medium text-blue-800 mb-1">How to add your thoughts:</p>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5">①</span>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Click any verse</span> to open a comment box for that verse.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5">②</span>
            <p className="text-sm text-gray-700">
              To annotate <span className="font-medium">multiple verses</span>, click on the
              <span className="font-medium"> last verse</span> in the passage —
              you can reference the full range in your comment.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5">③</span>
            <p className="text-sm text-gray-700">
              Type your reflection and tap <span className="font-medium">Save</span>.
            </p>
          </div>
        </div>

        {/* Don't show again */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <label
            htmlFor="dontShowAgain"
            className="text-sm text-gray-500 cursor-pointer select-none"
          >
            Don&apos;t show this again
          </label>
        </div>

        {/* Got it button */}
        <button
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          Got it &mdash; Let&apos;s read together!
        </button>
      </div>
    </div>
  );
}
