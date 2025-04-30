// app/auth/signup/page.tsx
'use client';

import Link from 'next/link';
import SignUpForm from '@/components/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-50 to-primary-100">
      <h2 className="text-2xl font-bold mb-4">Create an account</h2>
      <SignUpForm />
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-primary-600 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
