'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function OnboardingPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [step, setStep] = useState(1);
  const [boardName, setBoardName] = useState('My First Board');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userId) {
    router.push('/sign-in');
    return null;
  }

  const handleSkip = () => {
    // Just redirect to board - they can create boards later
    router.push('/board');
  };

  const handleCreateBoard = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // TODO: Create board via API
      // For now, just redirect to board page
      router.push('/board');
    } catch (err) {
      console.error('Error creating board:', err);
      setError('Failed to create board');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-900 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="glass-effect rounded-3xl p-8 text-center">
            <h1 className="text-3xl font-bold dark:text-white mb-4">Welcome to FlowBoard! 👋</h1>
            <p className="dark:text-gray-300 mb-8">
              Let&apos;s get you set up with your first project board.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl font-semibold text-white transition-all"
            >
              Get Started
            </button>
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-3 dark:text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2: Create Board */}
        {step === 2 && (
          <div className="glass-effect rounded-3xl p-8">
            <h2 className="text-2xl font-bold dark:text-white mb-6">Create Your First Board</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                Board Name
              </label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="w-full px-4 py-3 dark:bg-white/5 border dark:border-white/10 rounded-xl dark:text-white focus:outline-none focus:border-primary-500"
                placeholder="e.g., Development Tasks"
              />
            </div>

            <button
              onClick={handleCreateBoard}
              disabled={isCreating || !boardName.trim()}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Board'}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 py-3 dark:text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
