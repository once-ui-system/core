"use client";

import { Button, Column, DropdownWrapper } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/** The account menu: Profile and Sign out. In demo mode there is no account to sign out of. */
export function UserMenu({ email, demo }: { email: string | null; demo: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    setOpen(false);
    await createBrowserSupabase().auth.signOut();
    router.replace("/auth");
    router.refresh();
  };

  const label = demo ? "Demo mode" : (email ?? "Account");

  return (
    <DropdownWrapper
      open={open}
      onOpenChange={setOpen}
      placement="bottom-end"
      trigger={
        <Button variant="tertiary" size="s" label={label} suffixIcon="chevronDown" onClick={() => setOpen(!open)} />
      }
      dropdown={
        <Column padding="8" gap="4" minWidth="160">
          <Button variant="tertiary" size="s" label="Profile" prefixIcon="person" href="/profile" fillWidth horizontal="start" onClick={() => setOpen(false)} />
          {!demo && (
            <Button variant="tertiary" size="s" label="Sign out" prefixIcon="logout" fillWidth horizontal="start" onClick={signOut} />
          )}
        </Column>
      }
    />
  );
}
