'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Sparkles } from 'lucide-react';
import { Card } from '@/types';

interface CardViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAIGenerate: () => void;
  card: Card | null;
}

export default function CardViewModal({
  isOpen,
  onClose,
  onEdit,
  onAIGenerate,
  card,
}: CardViewModalProps) {
  if (!card) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/60 light:bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-effect rounded-3xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white light:text-gray-900">
                  Card Details
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEdit}
                    className="p-2 rounded-xl dark:hover:bg-white/10 light:hover:bg-gray-100 dark:text-gray-400 light:text-gray-600 dark:hover:text-white light:hover:text-gray-900 transition-colors"
                    aria-label="Edit card"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl dark:hover:bg-white/10 light:hover:bg-gray-100 dark:text-gray-400 light:text-gray-600 dark:hover:text-white light:hover:text-gray-900 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-400 light:text-gray-600 mb-2">
                    Title
                  </label>
                  <div className="px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl">
                    <p className="dark:text-white light:text-gray-900">{card.title}</p>
                  </div>
                </div>

                {/* Description */}
                {card.description && (
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-400 light:text-gray-600 mb-2">
                      Description
                    </label>
                    <div className="px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl">
                      <p className="dark:text-gray-300 light:text-gray-700 whitespace-pre-wrap">
                        {card.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                {card.techStack && (
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-400 light:text-gray-600 mb-2">
                      Tech Stack
                    </label>
                    <div className="px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl">
                      <p className="dark:text-gray-300 light:text-gray-700">{card.techStack}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {card.notes && (
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-400 light:text-gray-600 mb-2">
                      Notes
                    </label>
                    <div className="px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl">
                      <p className="dark:text-gray-300 light:text-gray-700 whitespace-pre-wrap">
                        {card.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-400 light:text-gray-600 mb-2">
                    Last Updated
                  </label>
                  <div className="px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl">
                    <p className="dark:text-gray-400 light:text-gray-600 text-sm">
                      {new Date(card.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* AI Prompt Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAIGenerate}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all mt-6"
                  aria-label="Generate AI prompt"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate AI Prompt
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
