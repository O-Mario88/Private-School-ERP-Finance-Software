/**
 * NotificationCenter Component
 * Displays toast notifications in the bottom right
 */

import React, { useEffect } from 'react';
import { useUIStore } from '../store';

export default function NotificationCenter() {
  const notifications = useUIStore((state) => state.notifications);
  const clearNotification = useUIStore((state) => state.clearNotification);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => clearNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationToastProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  };
  onClose: () => void;
}

function NotificationToast({ notification, onClose }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    const baseStyles = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in';
    const typeStyles = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return `${baseStyles} ${typeStyles[notification.type]}`;
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
  };

  return (
    <div className={getStyles()}>
      <span className="text-lg font-bold">{icons[notification.type]}</span>
      <span className="flex-1">{notification.message}</span>
      <button
        onClick={onClose}
        className="text-lg opacity-60 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
}
