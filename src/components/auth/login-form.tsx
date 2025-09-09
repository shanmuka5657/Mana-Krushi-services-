
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
import { Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


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
  const [isInstallDialogOpen, setIsInstallDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      // Only show the dialog automatically once per session, if not already seen.
      if (!sessionStorage.getItem('installPromptSeen')) {
        setIsInstallDialogOpen(true); 
        sessionStorage.setItem('installPromptSeen', 'true');
      }
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
        setInstallPrompt(null);
        setIsInstallDialogOpen(false);
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
      <AlertDialog open={isInstallDialogOpen} onOpenChange={setIsInstallDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Install Mana Krushi Services App</AlertDialogTitle>
                <AlertDialogDescription>
                    For a better experience, install our app on your device. It's fast, works offline, and is just one click away from your home screen.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsInstallDialogOpen(false)}>Later</AlertDialogCancel>
                <AlertDialogAction onClick={handleInstallClick}>
                    <Download className="mr-2 h-4 w-4" />
                    Install
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        {installPrompt && (
            <CardFooter className="flex-col gap-2">
                <div className="w-full h-px bg-border" />
                <Button variant="outline" className="w-full" onClick={handleInstallClick}>
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                </Button>
            </CardFooter>
        )}
      </Card>
    </>
  );
}
