
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

function PrivacyPolicyPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield />
                        Privacy Policy
                    </CardTitle>
                    <CardDescription>
                        Last updated: July 27, 2024
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                    <p>
                        MK Services ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                    </p>

                    <h3 className="font-semibold text-foreground pt-2">1. Information We Collect</h3>
                    <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the application.</li>
                        <li><strong>Vehicle & Route Data (for Owners):</strong> If you are a vehicle owner, we collect information about your vehicle (type, number) and the routes you create (locations, times, price).</li>
                        <li><strong>Location Data:</strong> To enhance safety and provide a better service, we may request access or permission to and track location-based information from your mobile device, either continuously or while you are using the application. You can change our access or permissions in your device’s settings.</li>
                        <li><strong>Booking Information:</strong> We collect details of the rides you book or offer, including destination, timing, and status.</li>
                    </ul>

                    <h3 className="font-semibold text-foreground pt-2">2. Use of Your Information</h3>
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:</p>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>Create and manage your account.</li>
                        <li>Facilitate the core functionality of the app: connecting drivers with passengers.</li>
                        <li>Enable user-to-user communications (e.g., driver contacting a passenger).</li>
                        <li>Process payments and refunds.</li>
                        <li>Increase the efficiency and operation of the application.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the application.</li>
                    </ul>

                    <h3 className="font-semibold text-foreground pt-2">3. Disclosure of Your Information</h3>
                    <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                     <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Between Users:</strong> When a booking is confirmed, we share necessary information between the owner/driver and the passenger. This includes your name and may include your mobile number to facilitate communication.</li>
                        <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                    </ul>

                    <h3 className="font-semibold text-foreground pt-2">4. Security of Your Information</h3>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h3 className="font-semibold text-foreground pt-2">5. Policy for Children</h3>
                    <p>
                        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                    </p>
                    
                    <h3 className="font-semibold text-foreground pt-2">6. Contact Us</h3>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us through the <Link href="/help" className="text-primary underline">Help page</Link>.
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <PrivacyPolicyPageContent />
        </Suspense>
    );
}

    