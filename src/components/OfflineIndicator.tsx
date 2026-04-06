/**
 * OfflineIndicator Component
 * Shows when the app is in offline mode
 */

import React from 'react';
import { useAuthStore } from '../store';

export default function OfflineIndicator() {
  const isOfflineMode = useAuthStore((state) => state.isOfflineMode);

  if (!isOfflineMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 px-4 py-3 z-50">
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16H5m10.896 0h3.895m-9.611-4h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-yellow-800 font-medium">
          Offline Mode: Changes will sync when connection is restored
        </span>
      </div>
    </div>
  );
}
