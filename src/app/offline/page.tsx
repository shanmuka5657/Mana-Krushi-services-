
"use client";

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <WifiOff className="h-16 w-16 text-muted-foreground" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            You're Offline
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            It looks like you've lost your internet connection. Some features may be unavailable.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try to reconnect
        </Button>
      </div>
    </main>
  );
}
