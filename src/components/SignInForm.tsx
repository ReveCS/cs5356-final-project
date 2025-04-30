// components/SignInForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function SignInForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: authError } = await signIn(email, password);
    setError(authError?.message ?? null);
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
      <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded">
        Sign In
      </button>
    </form>
  );
}
