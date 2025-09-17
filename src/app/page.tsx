
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import placeholderImages from "@/lib/placeholder-images.json";

export default function WelcomePage() {
  const router = useRouter();
  const { logo } = placeholderImages;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-6">
        <Image
          src={logo.url}
          alt="Mana Krushi Services Logo"
          width={logo.width}
          height={logo.height}
          data-ai-hint={logo.hint}
          priority
        />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Mana Krushi Services
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your partner in shared travel. Find or offer a ride with ease.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => router.push('/signup')}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </main>
  );
}
