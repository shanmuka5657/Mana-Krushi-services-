
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
  FormDescription,
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUpWithEmail, sendOtp, confirmOtp, getRecaptchaVerifier } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import { Loader2, MessageSquareWarning, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { ConfirmationResult } from 'firebase/auth';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Enter a valid 10-digit mobile number." }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['owner', 'passenger'], { required_error: 'Please select a role.' }),
  referralCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});


export function SignupForm() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultLogo } = placeholderImages;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP State
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'passenger',
      referralCode: '',
      terms: false,
    },
  });

  useEffect(() => {
    const refCodeFromUrl = searchParams.get('ref');
    if (refCodeFromUrl) {
      form.setValue('referralCode', refCodeFromUrl);
    }
  }, [searchParams, form]);
  
  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    if (!isMobileVerified) {
        toast({
            title: "Mobile Not Verified",
            description: "Please verify your mobile number before creating an account.",
            variant: "destructive",
        });
        return;
    }
    setFormData(values);
    setShowConfirmation(true);
  }
  
  const mobileNumber = form.watch('mobile');
  const isMobileNumberValid = /^\d{10}$/.test(mobileNumber);

  useEffect(() => {
    // Reset verification status if mobile number changes
    setIsMobileVerified(false);
    setIsOtpSent(false);
    setOtpValue('');
  }, [mobileNumber]);


  async function handleSendOtp() {
      if (!isMobileNumberValid) {
        toast({ title: "Invalid Number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
        return;
      }
      
      setIsVerifying(true);
      
      try {
        const verifier = await getRecaptchaVerifier();
        const confirmation = await sendOtp(`+91${mobileNumber}`, verifier);
        confirmationResultRef.current = confirmation;
        setIsOtpSent(true);
        toast({ title: "OTP Sent!", description: "An OTP has been sent to your mobile number." });
      } catch (error: any) {
        console.error("Error sending OTP:", error);
        toast({ title: "Failed to Send OTP", description: "Please check the number and try again. A page refresh might be needed.", variant: "destructive" });
      } finally {
        setIsVerifying(false);
      }
  }
  
  async function handleConfirmOtp() {
    setTimeout(async () => {
      if (!otpValue || otpValue.length !== 6) {
          toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
          return;
      }
      if (!confirmationResultRef.current) {
           toast({ title: "Verification Error", description: "Please try sending the OTP again.", variant: "destructive" });
          return;
      }

      setIsVerifying(true);
      try {
        await confirmOtp(confirmationResultRef.current, otpValue);
        setIsMobileVerified(true);
        setIsOtpSent(false);
        toast({ title: "Success!", description: "Your mobile number has been verified." });
      } catch (error) {
        console.error("Error confirming OTP:", error);
        toast({ title: "Invalid OTP", description: "The code you entered is incorrect. Please try again.", variant: "destructive" });
      } finally {
        setIsVerifying(false);
      }
    }, 50);
  }


  async function handleConfirmation() {
    if (!formData) return;
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
        await signUpWithEmail(formData.name, formData.email, formData.password, formData.mobile, formData.role, formData.referralCode, true);
        toast({
            title: "Account Created!",
            description: "You have been successfully signed up.",
        });
        router.push(`/dashboard?role=${formData.role}`);
    } catch (error: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already in use. Please log in instead.";
        }
        toast({
            title: "Sign-up Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div id="recaptcha-container"></div>
      <div className="flex flex-col items-center text-center mb-6">
        <Image 
            src={defaultLogo.url}
            alt="Mana Krushi Logo"
            width={80}
            height={80}
            priority
            data-ai-hint={defaultLogo.hint}
        />
        <h2 className="text-2xl font-bold mt-2">Mana Krushi</h2>
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
                 <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                       <div className="flex items-start gap-2">
                        <FormControl>
                            <Input 
                                type="tel" 
                                placeholder="10-digit mobile number" 
                                {...field} 
                                disabled={isOtpSent || isMobileVerified}
                            />
                        </FormControl>
                         {isMobileVerified ? (
                            <Button type="button" variant="outline" className="text-green-600 border-green-300" disabled>
                                <CheckCircle className="mr-2 h-4 w-4"/> Verified
                            </Button>
                         ) : (
                            <Button type="button" variant="outline" onClick={handleSendOtp} disabled={!isMobileNumberValid || isVerifying || isOtpSent}>
                                {isVerifying ? <Loader2 className="animate-spin" /> : <MessageSquareWarning className="mr-2 h-4 w-4"/>}
                                Verify
                            </Button>
                         )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {isOtpSent && !isMobileVerified && (
                     <FormItem>
                      <FormLabel>Enter OTP</FormLabel>
                      <div className="flex items-start gap-2">
                        <FormControl>
                            <Input 
                                type="text"
                                placeholder="6-digit code"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value)}
                                maxLength={6}
                            />
                        </FormControl>
                         <Button type="button" variant="default" onClick={handleConfirmOtp} disabled={isVerifying || otpValue.length !== 6}>
                            {isVerifying ? <Loader2 className="animate-spin" /> : "Confirm"}
                         </Button>
                      </div>
                      <FormDescription>
                          Didn't receive the code? <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleSendOtp} disabled={isVerifying}>Resend OTP</Button>
                      </FormDescription>
                    </FormItem>
                )}

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
                      <Input placeholder="Enter code from a friend" {...field} disabled={!!searchParams.get('ref')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Accept terms and conditions
                      </FormLabel>
                      <FormDescription>
                        You agree to our{' '}
                        <Link href="/disclaimer" className="underline hover:text-primary">
                            Terms & Disclaimer
                        </Link>
                        .
                      </FormDescription>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full" disabled={isSubmitting || !isMobileVerified}>
                 {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          </Form>
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
