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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}>
      {/* Background glow ring */}
      <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[140%] h-[60%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(15, 29, 50, 0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.05)',
          }}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🏫</h1>
            <h2 className="text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MAPLE ERP
            </h2>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>School Finance Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
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

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Demo Credentials (for testing):
            </p>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
              Email: bursar@maplesch.com<br />
              Password: demo123
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>© 2026 MAPLE ERP. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
