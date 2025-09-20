
"use client";

import { useState, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getAllProfiles, getBookings } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Loader2, Users, UserCheck } from 'lucide-react';
import type { Profile, Booking } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type TargetAudience = 'all' | 'upcoming';

function AdminMessagingPage() {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [audience, setAudience] = useState<TargetAudience>('all');
    const { toast } = useToast();

    const handleSend = async () => {
        if (!message.trim()) {
            toast({
                title: 'Message is empty',
                description: 'Please write a message before sending.',
                variant: 'destructive',
            });
            return;
        }

        setIsSending(true);
        let targetUsers: { mobile: string }[] = [];

        if (audience === 'all') {
            const allProfiles: Profile[] = await getAllProfiles();
            targetUsers = allProfiles.filter(p => p.mobile && p.mobile !== '0000000000');
        } else {
            const allBookings: Booking[] = await getBookings(true);
            const now = new Date();
            const upcomingBookings = allBookings.filter(b => 
                new Date(b.departureDate) > now && b.status === 'Confirmed'
            );

            // Get unique users to avoid duplicate messages
            const uniqueUsers = new Map<string, { mobile: string }>();
            upcomingBookings.forEach(booking => {
                if (booking.mobile && booking.mobile !== '0000000000') {
                    uniqueUsers.set(booking.mobile, { mobile: booking.mobile });
                }
            });
            targetUsers = Array.from(uniqueUsers.values());
        }

        if (targetUsers.length === 0) {
            toast({
                title: 'No Users Found',
                description: 'There are no users to message for the selected audience.',
                variant: 'destructive',
            });
            setIsSending(false);
            return;
        }

        toast({
            title: `Preparing to send ${targetUsers.length} messages...`,
            description: 'Your browser may ask for permission to open multiple windows. Please allow it.',
        });

        // Add a small delay to allow the toast to show up before potential browser blocking
        setTimeout(() => {
            let sentCount = 0;
            targetUsers.forEach(user => {
                // Use the +91 prefix for Indian numbers for better compatibility
                const whatsappUrl = `https://wa.me/91${user.mobile}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                sentCount++;
            });
            
            setIsSending(false);
            
            toast({
                title: 'Messages Initiated',
                description: `${sentCount} WhatsApp chat windows have been opened. Please review and send each message manually.`,
            });
        }, 2000);
    };

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare /> Bulk Messaging
                    </CardTitle>
                    <CardDescription>
                        Compose a message and send it to your users via WhatsApp.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-medium">1. Choose your audience</Label>
                         <RadioGroup
                            defaultValue="all"
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                            value={audience}
                            onValueChange={(value: TargetAudience) => setAudience(value)}
                        >
                            <div>
                                <RadioGroupItem value="all" id="r1" className="peer sr-only" />
                                <Label
                                htmlFor="r1"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                <Users className="mb-3 h-6 w-6" />
                                All Users
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem
                                value="upcoming"
                                id="r2"
                                className="peer sr-only"
                                />
                                <Label
                                htmlFor="r2"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                <UserCheck className="mb-3 h-6 w-6" />
                                Users with Upcoming Rides
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div>
                        <Label htmlFor="message-area" className="font-medium">2. Compose your message</Label>
                        <Textarea
                            id="message-area"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                            rows={6}
                            className="mt-2"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send via WhatsApp
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </AppLayout>
    );
}

export default function MessagingPage() {
    return (
        <Suspense>
            <AdminMessagingPage />
        </Suspense>
    );
}
