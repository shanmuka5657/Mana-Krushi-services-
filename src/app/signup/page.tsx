
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const SignupForm = dynamic(
    () => import('@/components/auth/signup-form').then(mod => mod.SignupForm),
    { 
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }
);

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <SignupForm />
    </main>
  );
}
