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
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Left Section - Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <input
          type="text"
          placeholder="Search..."
          className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Right Section - Status & User */}
      <div className="flex items-center gap-6">
        {/* Sync Status */}
        <div className="flex items-center gap-2 text-sm">
          {isSyncing && (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600">Syncing...</span>
            </>
          )}
          {lastSyncTime && !isSyncing && (
            <span className="text-gray-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
              {user?.firstName.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${
                showUserMenu ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => navigate('/settings')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
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
