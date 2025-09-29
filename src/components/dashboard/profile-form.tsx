

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, ShieldCheck, Car, Fuel, Camera, CheckCircle, Badge, MessageSquareWarning, Globe, PhoneForwarded, TestTube2, Loader2, Copy, Gift, Video, RefreshCcw, Save, Edit, Bike, Home, Briefcase } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { format, addMonths } from "date-fns";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { saveProfile, getProfile, getCurrentUser, getCurrentUserName } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PaymentDialog from "./payment-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendOtp, confirmOtp } from "@/lib/auth";
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from "@/lib/firebase";


const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Enter a valid 10-digit mobile number." }),
  email: z.string().email({ message: "Invalid email address." }),
  selfieDataUrl: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  mileage: z.coerce.number().optional(),
  mobileVerified: z.boolean().default(false),
  additionalMobiles: z.string().optional(),
  referralCode: z.string().optional(),
  homeLocation: z.string().optional(),
  officeLocation: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', 'name': 'Australia' },
];

export default function ProfileForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [showPlanPrompt, setShowPlanPrompt] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // OTP State
  const [isVerifying, setIsVerifying] = useState(false);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      selfieDataUrl: "",
      country: "IN",
      address: "",
      vehicleType: "",
      vehicleNumber: "",
      mileage: 0,
      mobileVerified: false,
      additionalMobiles: "",
      referralCode: "",
      homeLocation: "",
      officeLocation: "",
    },
  });

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (typeof window !== 'undefined' && auth) {
        const { RecaptchaVerifier } = require('firebase/auth');
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
        });
    }
  }, [auth]);
  
   useEffect(() => {
    if (isCameraOn) {
        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
                setIsCameraOn(false);
            }
        };
        getCameraPermission();
    } else {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isCameraOn, toast]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setIsCameraOn(false);
      }
    }
  };
  
  const handleSaveSelfie = async () => {
      if (capturedImage) {
          form.setValue('selfieDataUrl', capturedImage);
          setCapturedImage(null); // Hide preview after saving to form state
           toast({
                title: "Selfie Saved",
                description: "Your new profile picture is ready. Click 'Save Changes' to finalize.",
            });
      }
  };


  useEffect(() => {
    const loadProfile = async () => {
        let userProfile = await getProfile();
        
        if (userProfile && !userProfile.referralCode) {
            const newReferralCode = `${userProfile.name.split(' ')[0].toLowerCase()}${Math.random().toString(36).substr(2, 4)}`;
            userProfile.referralCode = newReferralCode;
            await saveProfile(userProfile);
        }

        setProfile(userProfile);
        
        const userEmail = getCurrentUser();
        const userName = getCurrentUserName();

        const defaultValues: Partial<ProfileFormValues> = {
            name: userName || (userEmail ? userEmail.split('@')[0] : ''),
            email: userEmail || '',
            mobile: '',
            selfieDataUrl: '',
            country: 'IN',
            address: '',
            vehicleType: '',
            vehicleNumber: '',
            mileage: 0,
            mobileVerified: false,
            additionalMobiles: '',
            referralCode: '',
            homeLocation: '',
            officeLocation: '',
        };
        
        const combinedValues = { ...defaultValues, ...userProfile };

        if (userEmail === 'mana-krushi-admin@google.com' && (!userProfile || !userProfile.name)) {
            combinedValues.name = 'Admin';
        }

        if (userProfile?.additionalMobiles) {
            combinedValues.additionalMobiles = userProfile.additionalMobiles.join('\n');
        }

        form.reset(combinedValues);
        setIsLoading(false);
    };
    loadProfile();
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);
    const currentProfile = await getProfile();
    const { additionalMobiles, ...restOfData } = data;

    const additionalMobilesArray = additionalMobiles
        ?.split('\n')
        .map(num => num.trim())
        .filter(num => /^\d{10,15}$/.test(num))
        .slice(0, 100);

    const profileToSave: Profile = { 
        ...(currentProfile || {}), 
        ...restOfData,
        email: currentProfile?.email || data.email,
        additionalMobiles: additionalMobilesArray,
    };

    if (!profileToSave.role) {
        const userEmail = getCurrentUser();
        if (userEmail === 'mana-krushi-admin@google.com') {
            profileToSave.role = 'admin';
        }
    }

    try {
        await saveProfile(profileToSave);
        setProfile(profileToSave);

        toast({
          title: "Profile Updated!",
          description: "Your profile information has been saved.",
        });

        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (profileToSave.role === 'owner' && !profileToSave.planExpiryDate) {
          setShowPlanPrompt(true);
        }
    } catch(error) {
        console.error("Error saving profile:", error);
        toast({ title: "Save Failed", description: "Could not save your profile. Please try again.", variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  }

  const handleActivatePlan = () => {
    setShowPlanPrompt(false);
    setIsPaymentDialogOpen(true);
  }
  
  const handleVerifyClick = async () => {
    const mobile = form.getValues('mobile');
    if (!/^\d{10}$/.test(mobile)) {
      form.setError('mobile', { message: 'Please enter a valid 10-digit mobile number to verify.' });
      return;
    }
    
    const verifier = recaptchaVerifierRef.current;
    if (!verifier) {
        toast({ title: "reCAPTCHA Error", description: "Verifier not initialized. Please refresh.", variant: "destructive" });
        return;
    }

    setIsVerifying(true);
    try {
        const confirmation = await sendOtp(`+91${mobile}`, verifier);
        confirmationResultRef.current = confirmation;
        toast({ title: "OTP Sent!", description: "An OTP has been sent to your mobile number." });
        setIsOtpDialogOpen(true);
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        toast({ title: "Failed to Send OTP", description: "Please check the number and try again.", variant: "destructive" });
        // In case of error, re-render the verifier
        if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.render().catch(console.error);
        }
    } finally {
        setIsVerifying(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpValue || otpValue.length !== 6) {
        toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
        return;
    }
    if (!confirmationResultRef.current) {
        toast({ title: "Verification Error", description: "Please request a new OTP.", variant: "destructive" });
        return;
    }

    setIsVerifying(true);
    try {
      await confirmOtp(confirmationResultRef.current, otpValue);
      form.setValue('mobileVerified', true, { shouldDirty: true });
      const updatedProfile: Profile = { ...profile!, mobileVerified: true, mobile: form.getValues('mobile') };
      await saveProfile(updatedProfile);
      setProfile(updatedProfile);

      toast({
        title: 'Mobile Verified!',
        description: 'Your mobile number has been successfully verified.',
        action: <CheckCircle className="text-green-500" />,
      });
      setIsOtpDialogOpen(false);
      setOtpValue('');
    } catch (error) {
      console.error("Error confirming OTP:", error);
      toast({ title: "Invalid OTP", description: "The code you entered is incorrect. Please try again.", variant: "destructive" });
    } finally {
        setIsVerifying(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const newExpiryDate = addMonths(new Date(), 3);
    const updatedProfile: Profile = { ...profile!, planExpiryDate: newExpiryDate };
    await saveProfile(updatedProfile);
    setProfile(updatedProfile);
    toast({
        title: "Plan Activated!",
        description: `Your owner plan is now active until ${format(newExpiryDate, 'PPP')}.`,
        action: <CheckCircle className="text-green-500" />
    });
  }

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    toast({
        title: "Generating test data...",
        description: "This may take a moment."
    });

    try {
        for (let i = 1; i <= 100; i++) {
            const testProfile: Profile = {
                email: `${i}@gmail.com`,
                name: `Test User ${i}`,
                role: 'passenger',
                mobile: `90000000${i.toString().padStart(2, '0')}`,
                mobileVerified: true,
                status: 'active',
            };
            await saveProfile(testProfile);
        }
        toast({
            title: "Test Data Generated!",
            description: "100 passenger profiles have been created.",
        });
    } catch(e) {
        toast({
            title: "Error Generating Data",
            description: "Could not create all test profiles.",
            variant: "destructive"
        });
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      toast({
        title: "Referral Code Copied!",
        description: "You can now share it with your friends.",
      });
    }
  };

  const mobileNumber = form.watch('mobile');
  useEffect(() => {
    if (profile?.mobile && mobileNumber !== profile.mobile) {
        form.setValue('mobileVerified', false);
    }
  }, [mobileNumber, profile?.mobile, form]);

  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="space-y-6">
      <div id="recaptcha-container"></div>
      <AlertDialog open={showPlanPrompt} onOpenChange={setShowPlanPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Your Owner Plan</AlertDialogTitle>
            <AlertDialogDescription>
              To start adding routes, you need an active owner plan. A one-time fee of ₹50 activates your account for 3 months.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivatePlan}>Pay ₹50 to Activate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              A 6-digit code was sent to your mobile number. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleOtpSubmit} disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
        amount="50.00"
        description="This fee activates your owner plan for 3 months, allowing you to add and manage routes."
        title="Activate Owner Plan"
      />

      {profile?.role === 'owner' && profile?.planExpiryDate && (
        <Card className="shadow-sm bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-green-600 dark:text-green-500" />
                <span>Active Plan</span>
             </CardTitle>
             <CardDescription>Your plan is active and you can add routes.</CardDescription>
           </CardHeader>
           <CardContent>
                <div className="text-sm">
                    <span className="text-muted-foreground">Expires on:</span>{' '}
                    <span className="font-semibold">{format(new Date(profile.planExpiryDate), 'PPP')}</span>
                </div>
           </CardContent>
        </Card>
      )}

      {profile?.role === 'admin' && (
        <Card>
            <CardHeader>
                <CardTitle>Testing Tools</CardTitle>
                <CardDescription>Use these tools to generate data for testing purposes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleGenerateTestData} disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <TestTube2 className="mr-2 h-4 w-4" />
                    )}
                    Generate 100 Test Passengers
                </Button>
            </CardContent>
        </Card>
      )}
      
      {profile?.referralCode && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift/> Your Referral Code</CardTitle>
                <CardDescription>Share this code with your friends! They get a discount, and you get rewarded.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
                <Input value={profile.referralCode} readOnly className="font-mono text-lg" />
                <Button onClick={copyReferralCode} size="icon" variant="outline">
                    <Copy className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>A clear selfie helps build trust in the community.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
                <AvatarImage src={capturedImage || form.watch('selfieDataUrl')} />
                <AvatarFallback>
                    <User className="h-16 w-16" />
                </AvatarFallback>
            </Avatar>
            
            {isCameraOn && (
                <div className="w-full space-y-2">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                    {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex justify-center gap-2">
                         <Button onClick={handleCapture} disabled={hasCameraPermission === false}>
                            <Camera className="mr-2 h-4 w-4" />
                            Capture
                        </Button>
                        <Button variant="outline" onClick={() => setIsCameraOn(false)}>
                            Close Camera
                        </Button>
                    </div>
                </div>
            )}
            
            {capturedImage && (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setCapturedImage(null); setIsCameraOn(true); }}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Retake
                    </Button>
                    <Button onClick={handleSaveSelfie}>
                        <Save className="mr-2 h-4 w-4" />
                        Use This Photo
                    </Button>
                </div>
            )}
            
            {!isCameraOn && !capturedImage && (
                 <Button variant="outline" onClick={() => setIsCameraOn(true)}>
                    <Video className="mr-2 h-4 w-4" />
                    Open Camera
                </Button>
            )}

        </CardContent>
      </Card>


      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Enter your full name" {...field} className="pl-10" />
                      </div>
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
                    <FormLabel>Primary Mobile Number</FormLabel>
                     <div className="flex items-center gap-2">
                        <FormControl>
                          <div className="relative flex-grow">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="Enter your primary mobile"
                              {...field}
                              className="pl-10"
                              disabled={form.getValues('mobileVerified')}
                            />
                          </div>
                        </FormControl>
                        {form.getValues('mobileVerified') ? (
                           <Button
                            type="button"
                            variant="outline"
                            className="text-green-600 border-green-300"
                            disabled
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verified
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleVerifyClick}
                            disabled={isVerifying}
                          >
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquareWarning className="mr-2 h-4 w-4" />}
                            Verify
                          </Button>
                        )}
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="Enter your email" {...field} className="pl-10" disabled />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Country</FormLabel>
                 <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {countries.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    />
                </div>
              </FormItem>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                        <Textarea 
                          placeholder="Enter your full address" 
                          className="h-24"
                          {...field}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {profile?.role === 'passenger' && (
                <>
                <CardHeader className="-mx-6 -mb-6">
                    <CardTitle>My Commute</CardTitle>
                    <CardDescription>Save your daily commute to get automatic ride suggestions.</CardDescription>
                </CardHeader>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="homeLocation"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Home Location</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="e.g., Kukatpally, Hyderabad" {...field} className="pl-10" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="officeLocation"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Office/Work Location</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="e.g., Hitech City, Hyderabad" {...field} className="pl-10" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                </>
              )}


              {profile?.role === 'admin' && (
                 <FormItem>
                    <FormLabel>Additional Mobile Numbers</FormLabel>
                     <div className="relative">
                        <PhoneForwarded className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <FormField
                        control={form.control}
                        name="additionalMobiles"
                        render={({ field }) => (
                            <FormControl>
                                <Textarea
                                    placeholder="Enter up to 100 mobile numbers, one per line."
                                    {...field}
                                    className="pl-10 h-32"
                                />
                            </FormControl>
                        )}
                        />
                    </div>
                 </FormItem>
              )}

              {profile?.role === 'owner' && (
                <>
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                               <div className="relative">
                                {field.value === 'Bike' ? (
                                    <Bike className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                ) : (
                                    <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                )}
                               <SelectTrigger className="pl-10">
                                   <SelectValue placeholder="Select vehicle type" />
                               </SelectTrigger>
                               </div>
                           </FormControl>
                           <SelectContent>
                               <SelectItem value="Car">Car (Sedan, SUV, etc.)</SelectItem>
                               <SelectItem value="Bike">Bike / Scooter</SelectItem>
                           </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="e.g., AP 01 AB 1234" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Mileage (km/l)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Fuel className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input type="number" placeholder="e.g., 20" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}


              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    
