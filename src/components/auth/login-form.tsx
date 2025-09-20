
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
import { saveCurrentUser, getProfile, onGlobalLogoUrlChange, getGlobalLogoUrl } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { Download, Loader2, QrCode } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QRCode from 'qrcode.react';
import placeholderImages from '@/lib/placeholder-images.json';

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
  const [showQrDialog, setShowQrDialog] = React.useState(false);
  const [appUrl, setAppUrl] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState(placeholderImages.logo.url);


  React.useEffect(() => {
    // Set initial logo and subscribe to changes
    getGlobalLogoUrl().then(url => {
        if (url) setLogoUrl(url);
    });
    const unsub = onGlobalLogoUrlChange(url => {
        if (url) setLogoUrl(url);
    });

    // This will only run on the client
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
      unsub();
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
    
    if (userProfile.status === 'deleted') {
       toast({
        title: "Account Deleted",
        description: "This account has been deleted.",
        variant: "destructive",
      });
      form.setError('email', { message: 'This account has been deleted.' });
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
      <div className="flex flex-col items-center text-center mb-6">
        <Image src={logoUrl} alt="logo" width={100} height={100} className="object-contain" />
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
              <Button type="submit" className="w-full">
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
