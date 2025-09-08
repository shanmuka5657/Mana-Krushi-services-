

"use client";
import { AppLayout } from "@/components/layout/app-layout";
import ProfileForm from "@/components/dashboard/profile-form";
import { Suspense } from "react";

function ProfilePageContent() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <ProfileForm />
      </div>
    </AppLayout>
  );
}


export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfilePageContent />
        </Suspense>
    )
}
