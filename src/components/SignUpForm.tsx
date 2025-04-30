'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Success!  Redirect to home (or dashboard)
    router.push('/');
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
          disabled={loading}
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
          disabled={loading}
        />
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating account…' : 'Sign Up'}
      </button>
    </form>
  );
}
