
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Suspense } from 'react';

function HelpPageContent() {
    const faqs = [
        {
            question: "How do I book a ride?",
            answer: "As a passenger, go to the 'Find a Ride' tab on your dashboard. Enter your desired origin, destination, and travel date, then click 'Search'. Available rides will be displayed, and you can click 'Book Now' to secure your seat."
        },
        {
            question: "How do I add a route as an owner?",
            answer: "As an owner, navigate to the 'Add Route' tab on your dashboard. Fill in all the required details about the route, including locations, times, vehicle information, and price. Click 'Add Route' to make it available for passengers to book."
        },
        {
            question: "How can I see my bookings?",
            answer: "Passengers can view all their past and upcoming bookings under the 'My Bookings' tab. Owners can see all bookings for a specific route by going to 'My Routes' and clicking the 'View Bookings' button for the desired route."
        },
        {
            question: "How do payments work?",
            answer: "Payments are typically made in person to the driver at the time of the ride. After the ride is completed, the owner will mark your payment as received. Currently, we support Cash and UPI."
        },
        {
            question: "How do I report an issue?",
            answer: "If you have an issue with a ride or driver, you can submit a report after the ride is completed. Go to 'My Bookings', and a 'Report' button will appear for completed rides. Your feedback is submitted anonymously to the owner."
        }
    ];

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>Find answers to frequently asked questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function HelpPage() {
    return(
        <Suspense>
            <HelpPageContent />
        </Suspense>
    )
}
