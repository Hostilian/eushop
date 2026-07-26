import React, { useEffect, useState } from 'react';
import { trackEvent } from '../../lib/analytics/events';

interface SavedStateNotificationProps {
  message?: string;
  autoHideMs?: number;
  onDismiss?: () => void;
}

export const SavedStateNotification: React.FC<SavedStateNotificationProps> = ({
  message = 'Your preferences and cart state have been safely saved.',
  autoHideMs = 4000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    trackEvent('draft_saved_notice_shown');
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, autoHideMs);

    return () => clearTimeout(timer);
  }, [autoHideMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-2xl p-4 flex items-center space-x-3 text-xs text-gray-800 dark:text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
        ✓
      </div>
      <div className="flex-1">
        <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
          Work Preserved
        </span>
        <span className="text-gray-500 dark:text-gray-400">{message}</span>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          if (onDismiss) onDismiss();
        }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};
