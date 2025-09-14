
"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteAccount } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { clearCurrentUser } from '@/lib/storage';

function SettingsPageContent() {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        const result = await deleteAccount();
        setIsDeleting(false);

        if (result.success) {
            toast({
                title: "Account Deleted",
                description: "Your account has been marked for deletion.",
            });
            clearCurrentUser();
            router.push('/login');
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not delete account. Please try again.",
                variant: "destructive",
            });
            setShowDeleteConfirm(false);
        }
    };

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
                         <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will mark your account for deletion, and you will be logged out. Your data will be retained for administrative purposes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
