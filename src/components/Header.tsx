/**
 * Header Component
 * Displays user info, sync status, and search
 */

import React, { useState } from 'react';
import { useAuthStore, useUIStore, useSyncStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const lastSyncTime = useSyncStore((state) => state.lastSyncTime);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="px-8 py-4 flex items-center justify-between"
      style={{
        background: 'rgba(10, 22, 40, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Left Section - Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <input
          type="text"
          placeholder="Search..."
          className="input flex-1 max-w-xs"
        />
      </div>

      {/* Right Section - Status & User */}
      <div className="flex items-center gap-6">
        {/* Sync Status */}
        <div className="flex items-center gap-2 text-sm">
          {isSyncing && (
            <>
              <div className="animate-spin w-4 h-4 rounded-full" style={{ border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Syncing...</span>
            </>
          )}
          {lastSyncTime && !isSyncing && (
            <span style={{ color: 'var(--text-muted)' }}>
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-xl transition-all duration-200"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
              {user?.firstName.charAt(0)}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.firstName}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ color: 'var(--text-muted)' }}
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl z-10 overflow-hidden"
              style={{
                background: 'rgba(15, 29, 50, 0.95)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}>
              <button
                onClick={() => navigate('/settings')}
                className="w-full px-4 py-3 text-left text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Settings
              </button>
              <button
                onClick={() => { handleLogout(); setShowUserMenu(false); }}
                className="w-full px-4 py-3 text-left text-sm transition-colors"
                style={{ color: '#f87171', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
