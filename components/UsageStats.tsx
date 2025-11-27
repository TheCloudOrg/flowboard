'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CreditCard, Layout, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface UsageData {
  ai_prompts: {
    current: number;
    limit: number;
    percentage: number;
  };
  cards: {
    current: number;
    limit: number;
    percentage: number;
  };
  boards: {
    current: number;
    limit: number;
    percentage: number;
  };
}

interface UsageResponse {
  success: boolean;
  data?: {
    usage: UsageData;
    planTier: string;
    organizationId: string;
  };
  error?: string;
}

interface ProgressBarProps {
  current: number;
  limit: number;
  percentage: number;
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'accent' | 'success';
}

function ProgressBar({ current, limit, percentage, label, icon, color }: ProgressBarProps) {
  const colorClasses = {
    primary: {
      bg: 'from-primary-500 to-primary-600',
      text: 'text-primary-400',
      ring: 'ring-primary-500/20',
    },
    accent: {
      bg: 'from-accent-500 to-accent-600',
      text: 'text-accent-400',
      ring: 'ring-accent-500/20',
    },
    success: {
      bg: 'from-green-500 to-green-600',
      text: 'text-green-400',
      ring: 'ring-green-500/20',
    },
  };

  const colors = colorClasses[color];
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${colors.text}`}>{icon}</div>
          <span className="text-sm font-medium dark:text-gray-200 light:text-gray-800">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold dark:text-white light:text-gray-900">
            {current}
            <span className="text-xs dark:text-gray-400 light:text-gray-500 font-normal">
              {' '}
              / {limit === -1 ? '∞' : limit}
            </span>
          </span>
          {isAtLimit && (
            <span title="Limit reached">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 dark:bg-white/5 light:bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`absolute h-full bg-gradient-to-r ${colors.bg} ${
            isNearLimit ? 'opacity-100' : ''
          } ${isAtLimit ? 'bg-gradient-to-r from-red-500 to-red-600' : ''}`}
        />
        {isNearLimit && !isAtLimit && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute h-full w-full bg-gradient-to-r ${colors.bg}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        )}
      </div>

      {/* Percentage */}
      <div className="flex justify-end">
        <span
          className={`text-xs font-medium ${
            isAtLimit
              ? 'text-red-400'
              : isNearLimit
                ? 'text-yellow-400'
                : 'dark:text-gray-400 light:text-gray-600'
          }`}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default function UsageStats() {
  const { theme } = useTheme();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [planTier, setPlanTier] = useState<string>('Free Plan');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/usage');
      const data: UsageResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch usage stats');
      }

      if (data.data) {
        setUsageData(data.data.usage);
        setPlanTier(data.data.planTier);
      }
    } catch (err: any) {
      console.error('Error fetching usage stats:', err);
      setError(err.message || 'Failed to load usage stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function to be called after AI prompt usage
  useEffect(() => {
    const handleUsageUpdate = () => {
      fetchUsageStats();
    };

    window.addEventListener('usage-updated', handleUsageUpdate);
    return () => window.removeEventListener('usage-updated', handleUsageUpdate);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 shadow-card"
      >
        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
          <span className="text-sm dark:text-gray-400 light:text-gray-600">
            Loading usage stats...
          </span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 shadow-card border dark:border-red-500/20 light:border-red-500/30"
      >
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">Failed to load usage stats</p>
            <p className="text-xs dark:text-red-300 light:text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!usageData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6 shadow-card border dark:border-white/10 light:border-gray-200"
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${isExpanded ? 'mb-6' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
            <TrendingUp className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold dark:text-white light:text-gray-900">Usage Stats</h2>
            <p className="text-xs dark:text-gray-400 light:text-gray-600">{planTier}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs dark:text-gray-400 light:text-gray-600 hover:text-primary-400 transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Usage Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-5 mt-6"
        >
          {/* AI Prompts */}
          <ProgressBar
            current={usageData.ai_prompts.current}
            limit={usageData.ai_prompts.limit}
            percentage={usageData.ai_prompts.percentage}
            label="AI Prompts"
            icon={<Sparkles className="w-4 h-4" />}
            color="accent"
          />

          {/* Cards */}
          <ProgressBar
            current={usageData.cards.current}
            limit={usageData.cards.limit}
            percentage={usageData.cards.percentage}
            label="Cards"
            icon={<CreditCard className="w-4 h-4" />}
            color="primary"
          />

          {/* Boards */}
          <ProgressBar
            current={usageData.boards.current}
            limit={usageData.boards.limit}
            percentage={usageData.boards.percentage}
            label="Boards"
            icon={<Layout className="w-4 h-4" />}
            color="success"
          />

          {/* Refresh Button */}
          <div className="pt-3 border-t dark:border-white/10 light:border-gray-200">
            <button
              onClick={fetchUsageStats}
              disabled={isLoading}
              className="w-full px-4 py-2 text-xs font-medium dark:text-gray-400 light:text-gray-600 hover:text-primary-400 dark:bg-white/5 light:bg-gray-100 hover:bg-primary-500/10 rounded-lg transition-all"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
