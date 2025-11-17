'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<Card>) => void;
  card?: Card | null;
  columnId?: string;
}

export default function CardModal({
  isOpen,
  onClose,
  onSave,
  card,
  columnId,
}: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setNotes(card.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setNotes('');
    }
  }, [card, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
    });

    setTitle('');
    setDescription('');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setNotes('');
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
                  {card ? 'Edit Card' : 'New Card'}
                </h2>
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
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2"
                  >
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter card title"
                    className="w-full px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    autoFocus
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter card description"
                    rows={3}
                    className="w-full px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add additional notes"
                    rows={4}
                    className="w-full px-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 dark:bg-white/5 light:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl text-white font-medium shadow-lg hover:shadow-glow transition-all"
                  >
                    {card ? 'Update' : 'Create'}
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
