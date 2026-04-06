/**
 * Login Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { User, UserRole } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('bursar@maplesch.com');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock authentication - in real app, this would call backend
      const mockUser: User = {
        id: 'user_123',
        email,
        password_hash: '', // Not stored on client
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.BURSAR,
        permissions: ['view_invoices', 'post_payments', 'view_reports'],
        isActive: true,
        createdDate: new Date(),
        createdBy: 'admin',
      };

      setUser(mockUser);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏫</h1>
            <h2 className="text-2xl font-bold text-gray-900">MAPLE ERP</h2>
            <p className="text-gray-600 mt-2">School Finance Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your.email@school.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Demo Credentials (for testing):
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Email: bursar@maplesch.com<br />
              Password: demo123
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-white text-sm">
          <p>© 2026 MAPLE ERP. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
