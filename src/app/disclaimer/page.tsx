
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function DisclaimerPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle />
                        Legal Disclaimer
                    </CardTitle>
                    <CardDescription>
                        Important information about the use of Mana Krushi Services.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        Mana Krushi Services is a technology platform that connects private car owners with passengers who are seeking to share a ride to a common destination. It is strictly intended for non-commercial carpooling and cost-sharing purposes.
                    </p>
                    <h3 className="font-semibold text-foreground pt-2">For Vehicle Owners (Drivers):</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>You are not operating a commercial taxi or for-hire service.</li>
                        <li>The price you set for a ride should only be to recover the costs associated with the trip (e.g., fuel, tolls, vehicle wear and tear) and not for making a profit.</li>
                        <li>You must ensure that your vehicle is properly insured and that your insurance policy permits carpooling.</li>
                        <li>You must comply with all local and national traffic laws and regulations.</li>
                    </ul>
                    <h3 className="font-semibold text-foreground pt-2">For Passengers:</h3>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>You understand that you are entering into a cost-sharing arrangement with a private individual, not booking a commercial transport service.</li>
                        <li>While we provide features like mobile verification, you are responsible for your own safety and should exercise the same caution you would when traveling with someone you don't know.</li>
                    </ul>
                     <h3 className="font-semibold text-foreground pt-2">General:</h3>
                    <p>
                        The use of Mana Krushi Services is at your own risk. The platform is provided "as is" without any warranties. We are not liable for any incidents, accidents, damages, or losses that may occur during a carpool trip arranged through our platform.
                    </p>
                    <p>
                        By using this service, you agree to these terms. For any questions, please visit our <Link href="/help" className="text-primary underline">Help page</Link>.
                    </p>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function DisclaimerPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <DisclaimerPageContent />
        </Suspense>
    );
}
