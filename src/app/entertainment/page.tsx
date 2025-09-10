
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Youtube, Facebook, Instagram, MessageSquare, UtensilsCrossed } from 'lucide-react';

const apps = [
    {
        name: 'WhatsApp',
        icon: <MessageSquare className="h-10 w-10 text-green-500" />,
        href: 'whatsapp://app',
        color: 'bg-green-50'
    },
    {
        name: 'YouTube',
        icon: <Youtube className="h-10 w-10 text-red-600" />,
        href: 'https://www.youtube.com',
        color: 'bg-red-50'
    },
    {
        name: 'Facebook',
        icon: <Facebook className="h-10 w-10 text-blue-800" />,
        href: 'https://www.facebook.com/login/',
        color: 'bg-blue-50'
    },
    {
        name: 'Instagram',
        icon: <Instagram className="h-10 w-10 text-pink-600" />,
        href: 'https://www.instagram.com/accounts/login/',
        color: 'bg-pink-50'
    },
    {
        name: 'Zomato',
        icon: <UtensilsCrossed className="h-10 w-10 text-red-500" />,
        href: 'zomato://',
        color: 'bg-red-50'
    }
];

function EntertainmentPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Entertainment</CardTitle>
                    <CardDescription>Quick links to some of your favorite applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {apps.map((app) => (
                            <a
                                key={app.name}
                                href={app.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <Card className={`h-full flex flex-col items-center justify-center p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 ${app.color}`}>
                                    <div className="mb-4">
                                        {app.icon}
                                    </div>
                                    <h3 className="font-semibold text-lg text-foreground">{app.name}</h3>
                                </Card>
                            </a>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function EntertainmentPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <EntertainmentPageContent />
        </Suspense>
    );
}
