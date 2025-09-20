

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, ShieldCheck, Car, Fuel, Camera, CheckCircle, Badge, MessageSquareWarning, Globe, PhoneForwarded, TestTube2, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { format, addMonths } from "date-fns";
import Image from "next/image";

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


const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Enter a valid 10-digit mobile number." }),
  email: z.string().email({ message: "Invalid email address." }),
  country: z.string().optional(),
  address: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  mileage: z.coerce.number().optional(),
  selfieDataUrl: z.string().optional(),
  mobileVerified: z.boolean().default(false),
  additionalMobiles: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
];

export default function ProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [showPlanPrompt, setShowPlanPrompt] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      country: "IN",
      address: "",
      vehicleType: "",
      vehicleNumber: "",
      mileage: 0,
      selfieDataUrl: "",
      mobileVerified: false,
      additionalMobiles: "",
    },
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      // Only run this if there's no selfie taken
      if (selfie) return;

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Camera API not available.');
            setHasCameraPermission(false);
            return;
        }
        stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    if (!selfie) {
      getCameraPermission();
    }

    // Cleanup function to stop video stream
    return () => {
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [selfie]);

  useEffect(() => {
    const loadProfile = async () => {
        const userProfile = await getProfile();
        setProfile(userProfile);
        
        const userEmail = getCurrentUser();
        const userName = getCurrentUserName();

        const defaultValues: Partial<ProfileFormValues> = {
            name: userName || (userEmail ? userEmail.split('@')[0] : ''),
            email: userEmail || '',
            mobile: '',
            country: 'IN',
            address: '',
            vehicleType: '',
            vehicleNumber: '',
            mileage: 0,
            selfieDataUrl: '',
            mobileVerified: false,
            additionalMobiles: '',
        };
        
        const combinedValues = { ...defaultValues, ...userProfile };

        // For admin, ensure the name is always 'Admin' if not set
        if (userEmail === 'admin@example.com' && (!userProfile || !userProfile.name)) {
            combinedValues.name = 'Admin';
        }

        // Format additionalMobiles array back to a string for the textarea
        if (userProfile?.additionalMobiles) {
            combinedValues.additionalMobiles = userProfile.additionalMobiles.join('\n');
        }

        form.reset(combinedValues);

        if (userProfile?.selfieDataUrl) {
            setSelfie(userProfile.selfieDataUrl);
        }
    };
    loadProfile();
  }, [form]);

  const handleTakeSelfie = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          if (context) {
              const MAX_WIDTH = 800;
              const scale = MAX_WIDTH / video.videoWidth;
              canvas.width = MAX_WIDTH;
              canvas.height = video.videoHeight * scale;

              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG and quality 0.8
              setSelfie(dataUrl);
              form.setValue('selfieDataUrl', dataUrl);
          }
      }
  }

  const handleRetakeSelfie = () => {
    setSelfie(null);
    form.setValue('selfieDataUrl', '');
  };

  async function onSubmit(data: ProfileFormValues) {
    const currentProfile = await getProfile();
    const { additionalMobiles, ...restOfData } = data;
    
    const additionalMobilesArray = additionalMobiles
        ?.split('\n')
        .map(num => num.trim())
        .filter(num => /^\d{10,15}$/.test(num)) // Basic validation for phone numbers
        .slice(0, 100); // Limit to 100 numbers


    const profileToSave: Profile = { 
        ...currentProfile, 
        ...restOfData,
        additionalMobiles: additionalMobilesArray,
    };
    
    // Add role if it's missing (especially for admin's first save)
    if (!profileToSave.role) {
        const userEmail = getCurrentUser();
        if (userEmail === 'admin@example.com') {
            profileToSave.role = 'admin';
        }
    }

    await saveProfile(profileToSave);
    
    // Update local state to reflect changes immediately
    setProfile(profileToSave);

    toast({
      title: "Profile Updated!",
      description: "Your profile has been successfully updated.",
    });

    if (profileToSave.role === 'owner' && !profileToSave.planExpiryDate) {
      setShowPlanPrompt(true);
    }
  }

  const handleActivatePlan = () => {
    setShowPlanPrompt(false);
    setIsPaymentDialogOpen(true);
  }
  
  const handleVerifyClick = () => {
    const mobile = form.getValues('mobile');
    if (!/^\d{10}$/.test(mobile)) {
      form.setError('mobile', { message: 'Please enter a valid 10-digit mobile number to verify.' });
      return;
    }
    // In a real app, this would trigger an API call to send an OTP
    toast({
      title: 'OTP Sent (Simulated)',
      description: 'An OTP has been sent to your mobile. Please enter 123456 to verify.',
    });
    setIsOtpDialogOpen(true);
  };

  const handleOtpSubmit = async () => {
    // In a real app, you'd verify the OTP against your backend
    if (otpValue === '123456') {
      form.setValue('mobileVerified', true);
      const updatedProfile: Profile = { ...profile!, mobileVerified: true };
      await saveProfile(updatedProfile);
      setProfile(updatedProfile);

      toast({
        title: 'Mobile Verified!',
        description: 'Your mobile number has been successfully verified.',
        action: <CheckCircle className="text-green-500" />,
      });
      setIsOtpDialogOpen(false);
      setOtpValue('');
    } else {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSuccess = async () => {
    const newExpiryDate = addMonths(new Date(), 3);
    const updatedProfile: Profile = { ...profile!, planExpiryDate: newExpiryDate };
    await saveProfile(updatedProfile);
    setProfile(updatedProfile); // Update state to show new expiry date
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

  return (
    <div className="space-y-6">
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
            <Button onClick={handleOtpSubmit}>Verify Code</Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Take a selfie to set your profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/2 space-y-4">
                    <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                        {selfie ? (
                             <Image src={selfie} alt="Your selfie" layout="fill" objectFit="cover" />
                        ) : (
                           <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                     {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                 <div className="w-full sm:w-1/2 flex flex-col items-center gap-4">
                    <Avatar className="w-24 h-24 text-lg">
                        <AvatarImage src={selfie || profile?.selfieDataUrl} alt={profile?.name} />
                        <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <Button 
                        onClick={selfie ? handleRetakeSelfie : handleTakeSelfie}
                        disabled={!hasCameraPermission}
                    >
                        <Camera className="mr-2 h-4 w-4" />
                        {selfie ? 'Retake Selfie' : 'Take Selfie'}
                    </Button>
                 </div>
            </div>
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
                          <div className="flex items-center gap-1 text-sm text-green-600 font-medium px-3 py-2 rounded-md bg-green-50 border border-green-200">
                             <CheckCircle className="h-4 w-4" /> Verified
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleVerifyClick}
                          >
                            <MessageSquareWarning className="mr-2 h-4 w-4" />
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
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                           <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                           </div>
                        </FormControl>
                        <SelectContent>
                            {countries.map(c => (
                                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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

              {profile?.role === 'admin' && (
                <FormField
                  control={form.control}
                  name="additionalMobiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Mobile Numbers</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <PhoneForwarded className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Textarea
                            placeholder="Enter up to 100 mobile numbers, one per line."
                            {...field}
                            className="pl-10 h-32"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {profile?.role === 'owner' && (
                <>
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="e.g., Sedan, SUV, etc." {...field} className="pl-10" />
                          </div>
                        </FormControl>
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


              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

