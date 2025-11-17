'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string | null;
  isLoading: boolean;
  error: string | null;
  cardTitle: string;
}

export default function AIPromptModal({
  isOpen,
  onClose,
  prompt,
  isLoading,
  error,
  cardTitle,
}: AIPromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setCopied(false);
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
              className="glass-effect rounded-3xl p-6 w-full max-w-3xl max-h-[85vh] border border-white/20 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl">
                    <Sparkles className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white light:text-gray-900">
                      AI-Generated Prompt
                    </h2>
                    <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-1">
                      For: {cardTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl dark:hover:bg-white/10 light:hover:bg-gray-100 dark:text-gray-400 light:text-gray-600 dark:hover:text-white light:hover:text-gray-900 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
                    <p className="dark:text-gray-300 light:text-gray-700 text-lg">
                      Generating your prompt...
                    </p>
                    <p className="dark:text-gray-500 light:text-gray-500 text-sm">
                      This may take a few seconds
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="dark:text-red-300 light:text-red-600 text-center">{error}</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 dark:bg-white/5 light:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 font-medium transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}

                {!isLoading && !error && prompt && (
                  <>
                    {/* Prompt Display */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
                      <div className="dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-2xl p-6">
                        <pre className="whitespace-pre-wrap text-sm dark:text-gray-200 light:text-gray-800 font-mono leading-relaxed">
                          {prompt}
                        </pre>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t dark:border-white/10 light:border-gray-200">
                      <button
                        onClick={handleCopy}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl text-white font-medium shadow-lg hover:shadow-glow transition-all flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-5 h-5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleClose}
                        className="px-6 py-3 dark:bg-white/5 light:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 font-medium transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
