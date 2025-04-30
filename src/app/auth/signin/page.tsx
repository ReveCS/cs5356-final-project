// app/auth/signin/page.tsx
'use client';

import Link from 'next/link';
import SignInForm from '@/components/SignInForm';

export default function SignInPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-50 to-primary-100">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <SignInForm />
      <p className="mt-4 text-sm">
        Don’t have an account?{' '}
        <Link href="/auth/signup" className="text-primary-600 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
