

import { AppLayout } from "@/components/layout/app-layout";
import ProfileForm from "@/components/dashboard/profile-form";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <ProfileForm />
      </div>
    </AppLayout>
  );
}
