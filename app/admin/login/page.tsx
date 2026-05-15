'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Jebena } from '@/lib/icons';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl p-10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(249,245,240,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Jebena size={48} color="#C9A961" />
          <h1 className="font-display text-2xl text-cream text-center mt-3">
            Yeroo Coffee
          </h1>
          <p className="text-cream/60 text-sm text-center mt-1">Admin Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl p-3 text-cream text-sm outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(249,245,240,0.20)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,132,90,0.6)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(249,245,240,0.20)')}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl p-3 text-cream text-sm outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(249,245,240,0.20)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,132,90,0.6)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(249,245,240,0.20)')}
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
