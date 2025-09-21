
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useState, useEffect } from 'react';
import { Gift, Copy, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getProfile, saveProfile } from '@/lib/storage';
import type { Profile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';

function ReferralPageContent() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [referralUrl, setReferralUrl] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const loadProfile = async () => {
            let userProfile = await getProfile();
            
            // Generate referral code if it doesn't exist for an existing user
            if (userProfile && !userProfile.referralCode) {
                const newReferralCode = `${userProfile.name.split(' ')[0].toLowerCase()}${Math.random().toString(36).substr(2, 4)}`;
                userProfile.referralCode = newReferralCode;
                await saveProfile(userProfile); // Save the updated profile with the new code
            }

            setProfile(userProfile);

            if (userProfile?.referralCode) {
                setReferralUrl(`${window.location.origin}/signup?ref=${userProfile.referralCode}`);
            }
            setIsLoading(false);
        };
        loadProfile();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: "Copied!", description: "Referral link copied to clipboard." });
        }, () => {
            toast({ title: "Failed to copy", variant: "destructive" });
        });
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }
    
    if (!profile?.referralCode) {
        return (
            <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Referral Program</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Could not load your referral code. Please try again later.</p>
                    </CardContent>
                </Card>
            </AppLayout>
        );
    }
    
    const imageSettings = profile.selfieDataUrl
      ? {
          src: profile.selfieDataUrl,
          height: 40,
          width: 40,
          excavate: true,
        }
      : undefined;

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift /> Share & Earn
                        </CardTitle>
                        <CardDescription>
                            Share your referral code with friends. When they sign up, you both get rewards!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-muted-foreground">Scan this QR code to sign up with my referral code.</p>
                            <div className="p-4 bg-white rounded-lg border">
                                <QRCode 
                                    value={referralUrl} 
                                    size={256} 
                                    level="H"
                                    imageSettings={imageSettings}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium">Your Referral Code</label>
                            <div className="flex gap-2">
                                <Input value={profile.referralCode} readOnly className="font-mono text-lg" />
                                <Button onClick={() => copyToClipboard(profile.referralCode!)} size="icon" variant="outline">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                         <div className="space-y-2 text-left">
                            <label className="text-sm font-medium">Your Referral Link</label>
                             <div className="flex gap-2">
                                <Input value={referralUrl} readOnly className="text-sm" />
                                <Button onClick={() => copyToClipboard(referralUrl)} size="icon" variant="outline">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function ReferralPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <ReferralPageContent />
        </Suspense>
    );
}
