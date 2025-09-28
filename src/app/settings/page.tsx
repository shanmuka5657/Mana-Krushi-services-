

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
import { Loader2, History, Gift, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { clearCurrentUser } from '@/lib/storage';
import Link from 'next/link';

const NavLink = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);


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
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Manage your account, preferences, and more.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <NavLink 
                            href="/referral"
                            icon={Gift}
                            title="Refer & Earn"
                            description="Share your code and get rewards."
                        />
                         <NavLink 
                            href="/help"
                            icon={HelpCircle}
                            title="Help & Support"
                            description="Find answers to your questions."
                        />
                         <NavLink 
                            href="/privacy-policy"
                            icon={FileText}
                            title="Privacy Policy"
                            description="Read our data and privacy policy."
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Account Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
            </div>

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
