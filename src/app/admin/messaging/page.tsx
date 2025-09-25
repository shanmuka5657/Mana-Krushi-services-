"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useState } from 'react';
import { Rss, Send, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendBroadcastNotification } from '@/app/actions';

function MessagingCampaignsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            toast({
                title: "Incomplete Message",
                description: "Please provide both a title and a message.",
                variant: "destructive"
            });
            return;
        }

        setIsSending(true);
        const result = await sendBroadcastNotification({ title, message });
        setIsSending(false);

        if (result.success) {
            toast({
                title: "Notification Sent!",
                description: "Your message has been broadcast to all users.",
            });
            setTitle('');
            setMessage('');
        } else {
            toast({
                title: "Failed to Send",
                description: result.error || "An unknown error occurred.",
                variant: "destructive"
            });
        }
    };

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Rss />
                        Broadcast Notification
                    </CardTitle>
                    <CardDescription>Send a push notification to all app users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="notification-title">Title</Label>
                        <Input 
                            id="notification-title"
                            placeholder="e.g., New Feature!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notification-message">Message</Label>
                        <Textarea
                            id="notification-message"
                            placeholder="Describe your announcement..."
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Notification
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function MessagingPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <MessagingCampaignsPage />
        </Suspense>
    );
}
