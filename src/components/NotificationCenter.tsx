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

  const getStyles = (): React.CSSProperties => {
    const borderColors = {
      success: 'rgba(16, 185, 129, 0.4)',
      error: 'rgba(239, 68, 68, 0.4)',
      warning: 'rgba(245, 158, 11, 0.4)',
      info: 'rgba(56, 189, 248, 0.4)',
    };
    const glowColors = {
      success: 'rgba(16, 185, 129, 0.1)',
      error: 'rgba(239, 68, 68, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      info: 'rgba(56, 189, 248, 0.1)',
    };
    return {
      background: 'rgba(15, 29, 50, 0.9)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${borderColors[notification.type]}`,
      boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 20px ${glowColors[notification.type]}`,
      borderRadius: '1rem',
    };
  };

  const textColors = {
    success: '#6ee7b7',
    error: '#fca5a5',
    warning: '#fcd34d',
    info: '#7dd3fc',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3" style={getStyles()}>
      <span className="text-lg font-bold" style={{ color: textColors[notification.type] }}>{icons[notification.type]}</span>
      <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{notification.message}</span>
      <button
        onClick={onClose}
        className="text-lg transition-opacity"
        style={{ color: 'var(--text-muted)', opacity: 0.6 }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
      >
        ×
      </button>
    </div>
  );
}
