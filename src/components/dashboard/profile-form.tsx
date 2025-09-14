
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, ShieldCheck, Car, Fuel, Camera } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
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

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Enter a valid 10-digit mobile number." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  mileage: z.coerce.number().optional(),
  selfieDataUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      address: "",
      vehicleType: "",
      vehicleNumber: "",
      mileage: 0,
      selfieDataUrl: "",
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
    getCameraPermission();

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

        const defaultValues: ProfileFormValues = {
            name: userName || (userEmail ? userEmail.split('@')[0] : ''),
            email: userEmail || '',
            mobile: '',
            address: '',
            vehicleType: '',
            vehicleNumber: '',
            mileage: 0,
            selfieDataUrl: '',
        };
        
        const combinedValues = { ...defaultValues, ...userProfile };

        if (userProfile) {
            form.reset(combinedValues);
            if (userProfile.selfieDataUrl) {
                setSelfie(userProfile.selfieDataUrl);
            }
        } else if (userEmail) {
            form.reset(defaultValues);
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
    const profileToSave: Profile = { ...currentProfile, ...data };

    await saveProfile(profileToSave);
    
    // Update local state to reflect changes immediately
    setProfile(profileToSave);

    toast({
      title: "Profile Updated!",
      description: "Your profile has been successfully updated.",
    });
  }

  return (
    <div className="space-y-6">
      {profile?.planExpiryDate && (
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
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="tel" placeholder="Enter your mobile number" {...field} className="pl-10" />
                      </div>
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
