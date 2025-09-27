
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
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';
import { Loader2, Download, QrCode } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { signInWithEmail } from '@/lib/auth';
import { getProfile } from '@/lib/storage';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { defaultLogo } = placeholderImages;
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstallable, setIsAppInstallable] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setLoginUrl(window.location.href);
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsAppInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({ title: 'Installation successful!' });
      } else {
        toast({ title: 'Installation dismissed.' });
      }
      setInstallPrompt(null);
      setIsAppInstallable(false);
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
    try {
      await signInWithEmail(values.email, values.password);
      
      const userProfile = await getProfile(values.email);
      const role = userProfile?.role || 'passenger';
      
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || `/dashboard?role=${role}`);

    } catch (error: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error.message.includes('auth/invalid-credential') || error.message.includes('auth/user-not-found') || error.message.includes('auth/wrong-password')) {
            errorMessage = "Invalid email or password. Please check your credentials or sign up.";
        } else if (error.message.includes('This account has been deleted')) {
            errorMessage = "This account has been deleted.";
        }
        
        toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
    }
  }

  return (
    <>
      <div className="flex flex-col items-center text-center mb-6">
        <Image 
            src={defaultLogo.url}
            alt="Mana Krushi Logo"
            width={80}
            height={80}
            data-ai-hint={defaultLogo.hint}
        />
        <h2 className="text-2xl font-bold mt-2">Mana Krushi</h2>
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
                      <Input placeholder="you@example.com" {...field} autoComplete="email" />
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
                      <Input type="password" placeholder="••••••••" {...field} autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Login'}
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
         <CardFooter className="flex flex-col gap-4">
            <div className='relative w-full flex items-center justify-center text-xs uppercase text-muted-foreground'>
                <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-border'></div>
                </div>
                <span className='relative bg-card px-2'>OR</span>
            </div>

            {isAppInstallable && (
                <Button variant="outline" className="w-full" onClick={handleInstallClick}>
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                </Button>
            )}
            
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan to Install
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle>Scan to Install App</DialogTitle>
                        <DialogDescription>
                            Open your phone's camera and point it at the QR code to open this page and install the app.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                       {loginUrl && <QRCode value={loginUrl} size={200} />}
                    </div>
                </DialogContent>
            </Dialog>

        </CardFooter>
      </Card>
    </>
  );
}
