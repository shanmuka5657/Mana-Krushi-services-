
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function SettingsPageContent() {
    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your account and application settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-medium">Notifications</h4>
                            <p className="text-sm text-muted-foreground">Manage how you receive notifications.</p>
                        </div>
                        <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-medium">Appearance</h4>
                            <p className="text-sm text-muted-foreground">Customize the look and feel of the app.</p>
                        </div>
                         <Button variant="outline">Customize</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
                        <div>
                            <h4 className="font-medium text-destructive">Delete Account</h4>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                        </div>
                         <Button variant="destructive">Delete</Button>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}


export default function SettingsPage() {
    return (
        <Suspense>
            <SettingsPageContent />
        </Suspense>
    )
}
