'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminToken } from '@/services/adminAuth';

// Same backend address as the rest of the dashboard (.env.local / Vercel settings)
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Please enter username and password.');
      }

      // FIX: check the username and password with the backend. Before, any
      // username/password was accepted and a fake token was saved.
      let response: Response;
      try {
        response = await fetch(`${API_ORIGIN}/api/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });
      } catch {
        throw new Error(
          "Can't reach the server. It may be waking up, so wait a minute and try again."
        );
      }

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Wrong username or password.');
      }
      if (!response.ok) {
        throw new Error(data?.error || `Login failed (${response.status}).`);
      }
      if (typeof data?.token !== 'string' || !data.token) {
        throw new Error('The server did not return a login token.');
      }

      setAdminToken(data.token);
      router.replace('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center text-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="3" width="16" height="14" rx="3" />
              <path d="M4 11h16M8 21v-2M16 21v-2M7.5 14.5h.01M16.5 14.5h.01" />
            </svg>
          </span>
          <div className="space-y-1.5">
            <h1 className="font-[family-name:var(--font-display)] text-[28px] font-bold tracking-tight text-[#0b1220]">
              Fleet Admin
            </h1>
            <p className="text-sm text-slate-500">Sign in to manage the campus shuttle fleet</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-[0_8px_24px_rgba(11,18,32,0.06)] space-y-5">
          {error && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input
                id="login-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/25 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">StackForce · RSU Campus Shuttle Tracking</p>
      </div>
    </div>
  );
}