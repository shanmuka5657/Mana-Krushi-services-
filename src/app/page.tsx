
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Mana Krushi Services
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
