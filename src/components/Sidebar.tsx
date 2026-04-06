/**
 * Sidebar Navigation Component
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store';
import { UserRole } from '../types/index';

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    ];

    const roleItems: Record<string, Array<any>> = {
      [UserRole.SUPER_ADMIN]: [
        { label: 'Accounting', path: '/accounting', icon: '📚' },
        { label: 'School', path: '/school', icon: '🏫' },
        { label: 'Collections', path: '/collections', icon: '💰' },
        { label: 'Settings', path: '/settings', icon: '⚙️' },
      ],
      [UserRole.BURSAR]: [
        { label: 'Accounting', path: '/accounting', icon: '📚' },
        { label: 'School', path: '/school', icon: '🏫' },
        { label: 'Collections', path: '/collections', icon: '💰' },
      ],
      [UserRole.ACCOUNTANT]: [
        { label: 'Accounting', path: '/accounting', icon: '📚' },
      ],
      [UserRole.CASHIER]: [
        { label: 'Collections', path: '/collections', icon: '💰' },
      ],
    };

    const additionalItems = roleItems[user?.role || ''] || [];
    return [...baseItems, ...additionalItems];
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`${
        isSidebarOpen ? 'w-64' : 'w-20'
      } bg-gray-900 text-white transition-all duration-300 overflow-y-auto`}
    >
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>
          MAPLE ERP
        </h1>
        <div className={`${isSidebarOpen ? 'hidden' : 'flex'} justify-center text-2xl`}>
          🏫
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 border-l-4 border-blue-400'
                : 'hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info Footer */}
      <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user?.firstName.charAt(0)}
          </div>
          {isSidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.firstName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
