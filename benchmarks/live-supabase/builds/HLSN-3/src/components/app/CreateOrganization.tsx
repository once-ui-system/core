"use client";

import { Button } from "@once-ui-system/core";
import { useState } from "react";
import { CreateOrgDialog } from "./CreateOrgDialog";

/** A button that opens the create-organization dialog. */
export function CreateOrganization() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Create organization" prefixIcon="plus" onClick={() => setOpen(true)} />
      <CreateOrgDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
