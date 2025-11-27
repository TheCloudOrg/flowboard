'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Layout, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (name: string) => Promise<void>;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onCreateBoard,
}: CreateBoardModalProps) {
  const [boardName, setBoardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateBoard(boardName.trim());
      setBoardName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create board');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBoardName('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-effect rounded-3xl p-8 w-full max-w-md border dark:border-white/20 light:border-gray-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl">
                    <Layout className="w-6 h-6 text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white light:text-gray-900">
                    Create New Board
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl dark:hover:bg-white/10 light:hover:bg-gray-100 dark:text-gray-400 light:text-gray-600 dark:hover:text-white light:hover:text-gray-900 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="boardName"
                    className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2"
                  >
                    Board Name
                  </label>
                  <input
                    id="boardName"
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                    autoFocus
                    disabled={isSubmitting}
                    maxLength={50}
                  />
                  <p className="text-xs dark:text-gray-500 light:text-gray-600 mt-1">
                    {boardName.length}/50 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-sm dark:text-red-300 light:text-red-600">{error}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 dark:bg-white/5 light:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !boardName.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Board'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
