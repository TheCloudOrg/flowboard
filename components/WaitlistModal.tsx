'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'pro' | 'business';
}

export default function WaitlistModal({ isOpen, onClose, plan }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          plan,
        }),
      });

      // Check if response has content before parsing
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server returned invalid response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setSuccess(true);
      setSuccessMessage(data.message || 'Successfully joined the waitlist');
      setEmail('');

      // Close modal after 2 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    onClose();
  };

  const planName = plan === 'pro' ? 'Pro' : 'Business';
  const planColor = plan === 'pro' ? 'from-purple-500 to-pink-500' : 'from-cyan-500 to-blue-500';

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
              className="glass-effect rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${planColor} rounded-xl`}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white light:text-gray-900">
                      Join the Waitlist
                    </h2>
                    <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-1">
                      {planName} Plan
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

              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold dark:text-white light:text-gray-900 mb-2">
                    {successMessage?.includes('already')
                      ? 'Already Registered!'
                      : "You're on the list!"}
                  </h3>
                  <p className="text-center dark:text-gray-400 light:text-gray-600">
                    {successMessage || `We'll notify you when the ${planName} plan is available.`}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Description */}
                  <div className="mb-6">
                    <p className="dark:text-gray-300 light:text-gray-700 leading-relaxed">
                      The {planName} plan is coming soon! Enter your email to be notified when it
                      launches and get early access.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-2"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 dark:text-gray-500 light:text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-3 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          required
                          autoFocus
                          disabled={isSubmitting}
                        />
                      </div>
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
                        className={`flex-1 px-6 py-3 bg-gradient-to-r ${planColor} hover:opacity-90 rounded-xl text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          'Join Waitlist'
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Trust indicators */}
                  <div className="mt-6 pt-6 border-t dark:border-white/10 light:border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm dark:text-gray-400 light:text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>No spam, unsubscribe anytime</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
