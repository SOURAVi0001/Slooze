'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Add a small delay to show the loading state/animation
        setTimeout(() => router.push('/dashboard'), 500);
      } else {
        setError(data.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Slooze</h1>
              <p className="mt-2 text-slate-500">Welcome back, please sign in.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 outline-none"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium h-12 rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="bg-slate-50/50 p-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider text-center">Quick Access for Demo</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => {setEmail('nick@shield.com'); setPassword('password123')}} className="text-xs text-left w-full px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-teal-600 transition-all border border-transparent hover:border-slate-200 flex justify-between group">
                <span>Admin</span>
                <span className="font-mono opacity-50 group-hover:opacity-100 transition-opacity">nick@shield.com</span>
              </button>
              <button onClick={() => {setEmail('carol@shield.com'); setPassword('password123')}} className="text-xs text-left w-full px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-teal-600 transition-all border border-transparent hover:border-slate-200 flex justify-between group">
                <span>Manager (IN)</span>
                <span className="font-mono opacity-50 group-hover:opacity-100 transition-opacity">carol@shield.com</span>
              </button>
              <button onClick={() => {setEmail('thanos@titan.com'); setPassword('password123')}} className="text-xs text-left w-full px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-teal-600 transition-all border border-transparent hover:border-slate-200 flex justify-between group">
                <span>Member (IN)</span>
                <span className="font-mono opacity-50 group-hover:opacity-100 transition-opacity">thanos@titan.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}