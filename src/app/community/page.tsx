"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Suspense } from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const communityLinks = [
    {
        title: "Community Partner 1",
        description: "Explore content from our first community partner.",
        url: "https://markswaitingrouge.com/fqb6bz1kmh?key=529e4d117553029b5e735a7949e66600"
    },
    {
        title: "Community Partner 2",
        description: "Discover exclusive offers from our second partner.",
        url: "https://markswaitingrouge.com/fxjbujzbs?key=ed1a1d3e8d82fcb894054cd12448d1e6"
    },
    {
        title: "Community Partner 3",
        description: "Check out the latest from our third partner.",
        url: "https://markswaitingrouge.com/mk5frp98z?key=d88f61df3f9560e02f039296479ff6ea"
    }
];


function CommunityPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        Community Spotlight
                    </CardTitle>
                    <CardDescription>
                        Featuring content and offers from our trusted community partners.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {communityLinks.map((link, index) => (
                         <Card key={index}>
                            <CardHeader>
                                <CardTitle>{link.title}</CardTitle>
                                <CardDescription>{link.description}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                        Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <CommunityPageContent />
        </Suspense>
    );
}
