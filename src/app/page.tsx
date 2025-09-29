
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import placeholderImages from "@/lib/placeholder-images.json";
import { onAuthStateChanged } from "@/lib/auth";
import { getProfile } from "@/lib/storage";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const { defaultLogo } = placeholderImages;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, redirect to the correct dashboard
        const profile = await getProfile(user.email!);
        const role = profile?.role || 'passenger';
        
        if (role === 'admin') {
            router.replace('/admin/dashboard');
        } else {
            router.replace(`/dashboard?role=${role}`);
        }

      } else {
        // User is signed out, show the welcome page
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <Image 
            src={defaultLogo.url}
            alt="Mana Krushi Logo"
            width={defaultLogo.width}
            height={defaultLogo.height}
            data-ai-hint={defaultLogo.hint}
        />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Mana Krushi
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your partner in shared travel. Find or offer a ride with ease.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row">
          <Button size="lg" className="w-full" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="lg" variant="secondary" className="w-full" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

    