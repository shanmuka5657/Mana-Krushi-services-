

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveCurrentUser, saveProfile, getProfile } from '@/lib/storage';
import placeholderImages from '@/lib/placeholder-images.json';
import type { Profile } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['owner', 'passenger'], { required_error: 'Please select a role.' }),
  referralCode: z.string().optional(),
});


export function SignupForm() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultLogo } = placeholderImages;
  
  const refCodeFromUrl = searchParams.get('ref');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'passenger',
      referralCode: refCodeFromUrl || '',
    },
  });
  
  useEffect(() => {
    if (refCodeFromUrl) {
      form.setValue('referralCode', refCodeFromUrl);
    }
  }, [refCodeFromUrl, form]);
  
  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setFormData(values);
    setShowConfirmation(true);
  }

  async function handleConfirmation() {
    if (!formData) return;
    
    // Generate a unique referral code for the new user
    const newReferralCode = `${formData.name.split(' ')[0].toLowerCase()}${Math.random().toString(36).substr(2, 4)}`;

    saveCurrentUser(formData.email, formData.name, formData.role);

    // Save the initial profile.
    const newProfile: Profile = {
      name: formData.name,
      email: formData.email,
      mobile: '0000000000', // Dummy number to be updated in profile settings
      role: formData.role,
      referralCode: newReferralCode,
      referredBy: formData.referralCode, // Store the code they used
    };

    await saveProfile(newProfile);
    
    setShowConfirmation(false);
    // Redirect to the dashboard after signup and "login"
    router.push(`/dashboard?role=${formData.role}`);
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
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
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="passenger">Passenger</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code from a friend" {...field} disabled={!!refCodeFromUrl} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/disclaimer" className="underline hover:text-primary">
              Terms & Disclaimer
            </Link>
            .
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm that the details you entered are correct before creating your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmation}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
