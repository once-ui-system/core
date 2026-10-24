import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/orgs/access";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Acme Notes account.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/app/profile");

  return (
    <main className="flex-1 p-4 md:p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Signed in as</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="break-all text-sm font-medium">{user.email || "No email on record"}</p>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
