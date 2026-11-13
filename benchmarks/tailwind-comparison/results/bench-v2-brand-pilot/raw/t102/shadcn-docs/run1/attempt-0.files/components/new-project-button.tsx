"use client";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function NewProjectButton() {
  return (
    <Button
      onClick={() =>
        toast.success("Project creation is coming soon", {
          description:
            "For now, your five existing projects are all listed below.",
        })
      }
    >
      <PlusIcon data-icon="inline-start" aria-hidden="true" />
      New project
    </Button>
  );
}
