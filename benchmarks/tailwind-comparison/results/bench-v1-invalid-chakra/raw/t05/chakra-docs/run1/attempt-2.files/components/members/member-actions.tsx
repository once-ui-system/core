"use client";

import { IconButton } from "@chakra-ui/react";
import { LuEllipsis, LuMailPlus, LuTrash2, LuUserCog } from "react-icons/lu";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import type { Member } from "@/lib/data";

interface MemberActionsProps {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResendInvite: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export function MemberActions({
  member,
  onChangeRole,
  onResendInvite,
  onRemove,
}: MemberActionsProps) {
  return (
    <MenuRoot
      positioning={{ placement: "bottom-end" }}
      ids={{ trigger: `actions-trigger-${member.id}`, content: `actions-content-${member.id}` }}
    >
      <MenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Actions for ${member.name}`}
        >
          <LuEllipsis />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="change-role" onClick={() => onChangeRole(member)}>
          <LuUserCog />
          Change role
        </MenuItem>
        {member.status === "Invited" && (
          <MenuItem value="resend-invite" onClick={() => onResendInvite(member)}>
            <LuMailPlus />
            Resend invite
          </MenuItem>
        )}
        <MenuSeparator />
        <MenuItem
          value="remove"
          color="fg.error"
          _hover={{ bg: "bg.error", color: "fg.error" }}
          onClick={() => onRemove(member)}
        >
          <LuTrash2 />
          Remove
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
