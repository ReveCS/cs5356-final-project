'use client';

import { useEffect, useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ClientLayout({
  children,
  className = '',
}: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a placeholder with the same dimensions during SSR
  if (!mounted) {
    return (
      <div className={className} style={{ minHeight: '100vh' }}>
        <div className="w-full h-full" />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
} 