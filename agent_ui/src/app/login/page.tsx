'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (login(password)) {
      router.push('/');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-stone-900 rounded-2xl shadow">
        <div className="text-center">
          <p className="text-xl text-gray-300 font-serif">Welcome back! Is that you? <br />Insert the secret word.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Secret word
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-stone-800 bg-stone-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-stone-600 focus:border-stone-600"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-stone-800 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
