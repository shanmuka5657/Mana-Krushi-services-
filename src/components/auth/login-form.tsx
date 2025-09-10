
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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Image from 'next/image';


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
  const [installState, setInstallState] = React.useState<'checking' | 'ready' | 'installed'>('checking');
  const [showInstallDialog, setShowInstallDialog] = React.useState(false);


  React.useEffect(() => {
    // This will only run on the client
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      setInstallState('installed');
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallState('ready');
      setShowInstallDialog(true);
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
          setInstallState('installed');
          toast({ title: "Installation Complete!", description: "The app has been successfully installed." });
        } else {
           toast({ title: "Installation Cancelled", variant: "destructive" });
        }
        setInstallPrompt(null);
        setShowInstallDialog(false);
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
      <AlertDialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Install Mana Krushi Services</AlertDialogTitle>
                  <AlertDialogDescription>
                      The app is ready to be installed on your device for a better experience.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <Button variant="ghost" onClick={() => setShowInstallDialog(false)}>Later</Button>
                  <Button onClick={handleInstallClick}>Install Now</Button>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col items-center text-center mb-6">
          <Image 
              src="https://i.ibb.co/7jHzB9d/logo.png"
              alt="Mana Krushi Services Logo"
              width={80}
              height={80}
              className="mb-4"
          />
      </div>
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
                    onClick={() => installState === 'ready' && setShowInstallDialog(true)}
                    disabled={installState !== 'ready'}
                >
                    {installState === 'checking' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {installState === 'checking' ? "Checking..." : "Install App"}
                    {installState === 'ready' && <Download className="ml-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        )}
      </Card>
    </>
  );
}
