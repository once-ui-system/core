import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/orgs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Acme Notes profile.",
};

export default async function Page() {
  const user = await getUser();
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Signed in as</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="font-medium">{user?.email}</p>
          <Link href="/app" className="text-sm underline">Back to the app</Link>
        </CardContent>
      </Card>
    </div>
  );
}
