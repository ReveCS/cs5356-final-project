'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // TODO: Update the signUp function in AuthContext to accept
    // firstName and lastName if you want to save them.
    // For now, we just call it with email and password.

    const { data, error: signUpError } = await signUp(email, password, firstName, lastName);
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
        <label className="block mb-1">First Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Last Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
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
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
