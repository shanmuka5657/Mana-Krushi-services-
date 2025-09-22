
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
import { Download, Loader2, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QRCode from 'qrcode.react';
import placeholderImages from '@/lib/placeholder-images.json';
import { signInWithEmail } from '@/lib/auth';
import { getProfile } from '@/lib/storage';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const { defaultLogo } = placeholderImages;


  useEffect(() => {
    setAppUrl(window.location.origin);
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
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
          setIsStandalone(true);
          toast({ title: "Installation Complete!", description: "The app has been successfully installed." });
        } else {
           toast({ title: "Installation Cancelled", variant: "destructive" });
        }
        setInstallPrompt(null);
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
            alt="Mana Krushi Services Logo"
            width={80}
            height={80}
            data-ai-hint={defaultLogo.hint}
        />
        <h2 className="text-2xl font-bold mt-2">Mana Krushi Services</h2>
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
        {!isStandalone && (
            <CardFooter className="flex-col gap-2">
                <div className="w-full h-px bg-border" />
                <div className="w-full grid grid-cols-2 gap-2">
                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleInstallClick}
                        disabled={!installPrompt}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Install App
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setShowQrDialog(true)}
                    >
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan to Install
                    </Button>
                </div>
            </CardFooter>
        )}
      </Card>
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-sm">
            <DialogHeader>
                <DialogTitle>Install on Your Phone</DialogTitle>
                <DialogDescription>
                    Scan this QR code with your phone's camera to open the app and install it.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg">
                  {appUrl ? <QRCode value={appUrl} size={200} level="H" /> : <Loader2 className="h-16 w-16 animate-spin" />}
                </div>
                <p className="text-sm text-muted-foreground font-mono text-center break-all px-4">{appUrl}</p>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
