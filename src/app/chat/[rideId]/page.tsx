
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { onChatMessages, sendChatMessage, getRideDetailsForChat } from '@/lib/storage';
import { getCurrentUser, getProfile } from '@/lib/storage';
import { Loader2, Send, ArrowLeft, Shield } from 'lucide-react';
import type { ChatMessage, Booking, Profile } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ChatRoomPage() {
    const params = useParams();
    const router = useRouter();
    const rideId = params.rideId as string;
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [rideDetails, setRideDetails] = useState<Booking | null>(null);
    const [participants, setParticipants] = useState<Map<string, Profile>>(new Map());
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const userEmail = getCurrentUser();
        setCurrentUserEmail(userEmail);

        if (!rideId || !userEmail) {
            router.push('/dashboard');
            return;
        }

        const fetchInitialData = async () => {
            const { ride, profiles } = await getRideDetailsForChat(rideId, userEmail);

            if (!ride) {
                // User is not part of this ride, or ride doesn't exist.
                router.push('/dashboard');
                return;
            }
            
            setRideDetails(ride);
            
            const profilesMap = new Map<string, Profile>();
            profiles.forEach(p => {
                if(p) profilesMap.set(p.email, p);
            });
            setParticipants(profilesMap);
            setIsLoading(false);
        };

        fetchInitialData();

        const unsubscribe = onChatMessages(rideId, setMessages);

        return () => unsubscribe();
    }, [rideId, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserEmail || !rideId) return;

        await sendChatMessage(rideId, currentUserEmail, newMessage);
        setNewMessage('');
    };
    
    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </AppLayout>
        );
    }

    if (!rideDetails) {
         return (
            <AppLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Chat Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This chat is no longer available or you do not have permission to view it.</p>
                        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                    </CardContent>
                </Card>
            </AppLayout>
        );
    }
    
    const isRideCompleted = rideDetails.status === 'Completed' || rideDetails.status === 'Cancelled';

    return (
        <AppLayout>
            <div className="flex flex-col h-full max-w-4xl mx-auto">
                 <Card className="flex-shrink-0">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-grow">
                                <CardTitle>{rideDetails.destination}</CardTitle>
                                <CardDescription>
                                    {format(new Date(rideDetails.departureDate), 'PPP, p')}
                                </CardDescription>
                            </div>
                             <div className="flex -space-x-2 overflow-hidden">
                                {Array.from(participants.values()).map(p => (
                                    <Avatar key={p.email} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" title={p.name}>
                                        <AvatarImage src={p.selfieDataUrl} />
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, index) => {
                        const sender = participants.get(msg.senderEmail);
                        const isCurrentUser = msg.senderEmail === currentUserEmail;
                        return (
                             <div key={index} className={cn("flex items-end gap-3", isCurrentUser ? "justify-end" : "justify-start")}>
                                {!isCurrentUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={sender?.selfieDataUrl} />
                                        <AvatarFallback>{sender?.name.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                     {!isCurrentUser && (
                                        <p className="text-xs font-semibold mb-1">{sender?.name}</p>
                                     )}
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.timestamp), 'p')}</p>
                                </div>
                                 {isCurrentUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={sender?.selfieDataUrl} />
                                        <AvatarFallback>{sender?.name.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t bg-background flex-shrink-0">
                   {isRideCompleted ? (
                       <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">
                           <Shield className="h-5 w-5 mx-auto mb-2" />
                           This chat is archived as the ride is complete.
                       </div>
                   ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                   )}
                </div>
            </div>
        </AppLayout>
    );
}

