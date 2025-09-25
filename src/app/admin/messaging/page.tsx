
"use client";

import { useState, Suspense, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getAllProfiles, getBookings } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Loader2, Users, UserCheck, PlusCircle } from 'lucide-react';
import type { Profile, Booking } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type TargetAudience = 'all' | 'upcoming';
type TargetUser = { name: string; mobile: string };

function AdminMessagingPage() {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [audience, setAudience] = useState<TargetAudience>('all');
    const [targetUsers, setTargetUsers] = useState<TargetUser[]>([]);
    const [manualNumber, setManualNumber] = useState('');
    const [isFetchingAudience, setIsFetchingAudience] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAudience = async () => {
            setIsFetchingAudience(true);
            let users: TargetUser[] = [];

            if (audience === 'upcoming') {
                const allBookings: Booking[] = await getBookings(true);
                const now = new Date();
                const upcomingBookings = allBookings.filter(b => 
                    new Date(b.departureDate) > now && b.status === 'Confirmed'
                );

                const uniqueUsers = new Map<string, TargetUser>();
                upcomingBookings.forEach(booking => {
                    if (booking.mobile && booking.mobile !== '0000000000') {
                        uniqueUsers.set(booking.mobile, { name: booking.client, mobile: booking.mobile });
                    }
                });
                users = Array.from(uniqueUsers.values());
            }
            setTargetUsers(users);
            setIsFetchingAudience(false);
        };

        fetchAudience();
    }, [audience]);
    
    const handleAddManualNumber = () => {
        if (!/^\d{10}$/.test(manualNumber)) {
            toast({
                title: 'Invalid Number',
                description: 'Please enter a valid 10-digit mobile number.',
                variant: 'destructive'
            });
            return;
        }

        if (targetUsers.some(u => u.mobile === manualNumber)) {
            toast({
                title: 'Number Already Exists',
                description: 'This mobile number is already in the recipient list.',
                variant: 'destructive'
            });
            return;
        }

        setTargetUsers(prev => [...prev, { name: `Manual Entry`, mobile: manualNumber }]);
        setManualNumber('');
    };

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
        let usersToMessage: TargetUser[] = [];

        if (audience === 'all') {
            const allProfiles: Profile[] = await getAllProfiles();
            usersToMessage = allProfiles
                .filter(p => p.mobile && p.mobile !== '0000000000')
                .map(p => ({ name: p.name, mobile: p.mobile }));
        } else {
            // For 'upcoming' or manual entries, the list is already in targetUsers
            usersToMessage = targetUsers;
        }
        
        // Add any manually added numbers if 'All Users' was selected
        if (audience === 'all') {
            const manualEntries = targetUsers.filter(u => u.name === 'Manual Entry' && !usersToMessage.some(p => p.mobile === u.mobile));
            usersToMessage = [...usersToMessage, ...manualEntries];
        }


        if (usersToMessage.length === 0) {
            toast({
                title: 'No Users Found',
                description: 'There are no users to message for the selected audience.',
                variant: 'destructive',
            });
            setIsSending(false);
            return;
        }

        toast({
            title: `Preparing to send ${usersToMessage.length} messages...`,
            description: 'Your browser may ask for permission to open multiple windows. Please allow it.',
        });

        setTimeout(() => {
            let sentCount = 0;
            usersToMessage.forEach(user => {
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
                        Compose a message and send it to your users via WhatsApp. This will open a WhatsApp chat for each user on your device.
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

                    <div className="space-y-2">
                        <Label htmlFor="manual-number" className="font-medium">Or add a number manually</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="manual-number"
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={manualNumber}
                                onChange={e => setManualNumber(e.target.value)}
                            />
                            <Button variant="outline" onClick={handleAddManualNumber}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </div>

                    {isFetchingAudience ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        targetUsers.length > 0 && (
                            <div className="space-y-2">
                                <Label>Recipients ({targetUsers.length})</Label>
                                <div className="border rounded-md max-h-48 overflow-y-auto">
                                    {targetUsers.map((user, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 text-sm border-b last:border-b-0">
                                            <span>{user.name}</span>
                                            <span className="text-muted-foreground font-mono">{user.mobile}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}

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
