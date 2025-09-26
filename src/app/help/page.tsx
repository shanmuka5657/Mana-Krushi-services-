
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Suspense } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

    const appStoreLongDescription = `Welcome to **Mana Krushi**, the ultimate ride-sharing and carpooling platform designed to make your travel easier, more affordable, and community-driven. Whether you're a passenger looking for a ride or a car owner with empty seats, our app seamlessly connects you.

**For Passengers:**
*   **Find a Ride with Ease:** Simply enter your starting point, destination, and travel date to find available rides from trusted vehicle owners.
*   **Book Instantly:** Secure your seat in just a few taps. Get instant confirmation and details about your driver and vehicle.
*   **Safe & Secure:** Travel with peace of mind. Our platform includes driver verification and a rating system to build a trustworthy community.
*   **Affordable Travel:** Save money on your commute or long-distance trips by sharing the cost with the vehicle owner.

**For Vehicle Owners:**
*   **Earn from Your Empty Seats:** Add your route, set your price, and let passengers book the empty seats in your car. Cover your fuel and maintenance costs.
*   **Manage Your Routes:** Easily add, edit, and manage your trips. View all your bookings and passenger details in one place.
*   **Seamless Payments:** Get paid for your rides. Our app helps you track payments and manage your earnings.
*   **Grow Your Client Base:** Connect with a network of passengers who are looking for reliable rides.

Join the Mana Krushi community today and transform the way you travel. Download the app, share the journey, and save together.`;

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
                         <AccordionItem value="app-store">
                            <AccordionTrigger>What text can I use for the app store listing?</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Short Description</Label>
                                    <p className="text-sm p-3 bg-muted rounded-md border">
                                        Connect with car owners & passengers for easy, affordable travel. Share rides, save money, and travel smart. Your go-to carpooling and ride-sharing community.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="long-description">Long Description (Click to select all and copy)</Label>
                                    <Textarea
                                        id="long-description"
                                        readOnly
                                        value={appStoreLongDescription}
                                        rows={20}
                                        onClick={(e) => e.currentTarget.select()}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
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

    