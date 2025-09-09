
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Phone, Mail, ShieldCheck, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

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

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Enter a valid 10-digit mobile number." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
        const userProfile = await getProfile();
        setProfile(userProfile);
        
        const userEmail = getCurrentUser();
        const userName = getCurrentUserName();

        const defaultValues = {
            name: userName || (userEmail ? userEmail.split('@')[0] : ''),
            email: userEmail || '',
            mobile: '',
            address: '',
        };

        if (userProfile) {
            form.reset({ ...defaultValues, ...userProfile });
        } else if (userEmail) {
            form.reset(defaultValues);
        }
    };
    loadProfile();
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    const currentProfile = await getProfile();
    const profileToSave = { ...currentProfile, ...data };
    await saveProfile(profileToSave as Profile);
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
