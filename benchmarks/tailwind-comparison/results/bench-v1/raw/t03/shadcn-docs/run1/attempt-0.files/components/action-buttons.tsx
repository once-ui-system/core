"use client";

import { FolderPlus, UserPlus } from "lucide-react";

import { useAppActions } from "@/components/app-context";
import { Button } from "@/components/ui/button";

export function CreateProjectButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const { openCreateProject } = useAppActions();
  return (
    <Button type="button" variant={variant} onClick={openCreateProject}>
      <FolderPlus aria-hidden="true" />
      Create project
    </Button>
  );
}

export function InviteMemberButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const { openInvite } = useAppActions();
  return (
    <Button type="button" variant={variant} onClick={openInvite}>
      <UserPlus aria-hidden="true" />
      Invite member
    </Button>
  );
}
