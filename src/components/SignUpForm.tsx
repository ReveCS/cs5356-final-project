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
  const [isLoading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, firstName, lastName);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Success! Redirect to home
      router.push('/');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <div className="mb-4">
        <label className="block mb-1">First Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Last Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Password</label>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-teal-900 text-white py-2 rounded transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
