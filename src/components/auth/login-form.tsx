
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveCurrentUser, getProfile } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { Download, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// Define the interface for the event, as it's not standard in all TS lib versions.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isInstallReady, setIsInstallReady] = React.useState(false);


  React.useEffect(() => {
    // This will only run on the client
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsInstallReady(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Hardcoded admin check
    if (values.email === 'admin@example.com') {
      if (values.password === 'admin123') {
        saveCurrentUser(values.email, 'Admin', 'admin');
        router.push(`/admin/dashboard`);
      } else {
        form.setError('password', { message: 'Invalid admin password.' });
      }
      return;
    }

    // Fetch profile for regular users
    const userProfile = await getProfile(values.email);

    if (!userProfile || !userProfile.role) {
      toast({
        title: "Login Failed",
        description: "No account found with this email. Please sign up.",
        variant: "destructive",
      });
      form.setError('email', { message: 'No account found with this email.' });
      return;
    }

    // In a real app, you would validate the password against the backend/database.
    // Here we assume the password is correct if the profile exists.

    const name = userProfile.name || values.email.split('@')[0];
    saveCurrentUser(userProfile.email, name, userProfile.role);
    
    router.push(`/dashboard?role=${userProfile.role}`);
  }

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
        {!isStandalone && (
            <CardFooter className="flex-col gap-2">
                <div className="w-full h-px bg-border" />
                <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleInstallClick}
                    disabled={!isInstallReady}
                >
                    {isInstallReady ? (
                        <Download className="mr-2 h-4 w-4" />
                    ) : (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isInstallReady ? 'Install App' : 'Checking for App...'}
                </Button>
            </CardFooter>
        )}
      </Card>
    </>
  );
}
