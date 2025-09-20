
"use client";

import { useState, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getAllProfiles } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import type { Profile } from '@/lib/types';

function AdminMessagingPage() {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
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

        const allProfiles: Profile[] = await getAllProfiles();
        const usersWithMobile = allProfiles.filter(p => p.mobile && p.mobile !== '0000000000');

        toast({
            title: `Preparing to send ${usersWithMobile.length} messages...`,
            description: 'Your browser may ask for permission to open multiple windows. Please allow it.',
        });

        // Add a small delay to allow the toast to show up before potential browser blocking
        setTimeout(() => {
            let sentCount = 0;
            usersWithMobile.forEach(profile => {
                // Use the +91 prefix for Indian numbers for better compatibility
                const whatsappUrl = `https://wa.me/91${profile.mobile}?text=${encodeURIComponent(message)}`;
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
                        Compose a message and send it to all users via WhatsApp.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message to all users here..."
                        rows={8}
                    />
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
