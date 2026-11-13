"use client";

import { Button } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Member } from "@/lib/data";

interface RemoveDialogProps {
  member: Member | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function RemoveDialog({ member, onClose, onConfirm }: RemoveDialogProps) {
  return (
    <DialogRoot
      role="alertdialog"
      open={member !== null}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
    >
      {member && (
        <DialogContent mx="4">
          <DialogHeader>
            <DialogTitle>Remove {member.name}?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {member.name} will lose access to your Lumen workspace right away.
            Issues assigned to them will become unassigned.
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              colorPalette="red"
              onClick={() => {
                onConfirm(member.id);
                onClose();
              }}
            >
              Remove member
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      )}
    </DialogRoot>
  );
}
