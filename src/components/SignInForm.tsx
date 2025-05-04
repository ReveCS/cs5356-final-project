// components/SignInForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function SignInForm() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: session, error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!session) {
      setError('Login succeeded but no session returned. Please check your credentials or confirm your email.');
      return;
    }

    // Redirect to home page
    router.replace('/');
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Password</label>
        <input
          type="password"
          className="w-full border px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        Sign In
      </button>
    </form>
  );
}
