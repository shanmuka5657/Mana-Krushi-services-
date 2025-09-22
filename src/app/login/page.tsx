
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LoginForm = dynamic(
    () => import('@/components/auth/login-form').then(mod => mod.LoginForm),
    { 
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading...</p>
            </div>
        )
    }
);

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <LoginForm />
    </main>
  );
}
