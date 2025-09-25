"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useState } from 'react';
import { Rss, Send, Loader2, BellRing } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendBroadcastNotification } from '@/app/actions';
import { getFCMToken } from '@/lib/firebase-messaging';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
    
    const handleRequestToken = async () => {
        try {
            const token = await getFCMToken();
            if (token) {
                navigator.clipboard.writeText(token);
                toast({
                    title: "FCM Token Copied!",
                    description: "Your registration token has been copied to the clipboard.",
                });
            } else {
                 toast({
                    title: "Could not get token",
                    description: "Please grant notification permission and try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error getting FCM token: ", error);
             toast({
                title: "Error requesting token",
                description: "There was an issue getting the FCM token. Check the console for details.",
                variant: "destructive",
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rss />
                            Broadcast Notification
                        </CardTitle>
                        <CardDescription>Send a push notification to all app users via the Firebase Console.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Alert>
                            <BellRing className="h-4 w-4" />
                            <AlertTitle>How to Send Notifications</AlertTitle>
                            <AlertDescription>
                                This form simulates sending. To send a real broadcast, use the Firebase Console. You can get your device's test token below to send a test message from the console.
                            </AlertDescription>
                        </Alert>
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
                                    Simulating...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Simulate Send
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Test Device Setup</CardTitle>
                        <CardDescription>Get your device's registration token to use for testing in the Firebase Console.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button variant="outline" onClick={handleRequestToken}>
                            Get My FCM Token
                        </Button>
                    </CardContent>
                </Card>
            </div>
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
