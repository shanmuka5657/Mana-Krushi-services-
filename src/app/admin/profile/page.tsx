

"use client";
import { AppLayout } from "@/components/layout/app-layout";
import ProfileForm from "@/components/dashboard/profile-form";
import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function AdminProfilePageContent() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
         <Card>
            <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Manage your administrator account details.</CardDescription>
            </CardHeader>
        </Card>
        <div className="mt-6">
            <ProfileForm />
        </div>
      </div>
    </AppLayout>
  );
}


export default function AdminProfilePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdminProfilePageContent />
        </Suspense>
    )
}
