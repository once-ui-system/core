import { pageMetadata } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePasswordForm } from "@/components/auth/auth-forms";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = pageMetadata({
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
  path: "/auth/update-password",
});

export default function UpdatePasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Set a new password</CardTitle>
            <CardDescription>This works from the link in your reset email.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
