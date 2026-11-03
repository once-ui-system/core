"use client";

import { DropdownWrapper, IconButton, Option, Column } from "@once-ui-system/core";
import type { Member } from "@/lib/data";

type RowActionsProps = {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResend: (member: Member) => void;
  onRemove: (member: Member) => void;
};

export function RowActions({ member, onChangeRole, onResend, onRemove }: RowActionsProps) {
  return (
    <DropdownWrapper
      placement="bottom-end"
      minWidth={12}
      trigger={
        <IconButton
          icon="moreHorizontal"
          variant="tertiary"
          size="s"
          ariaLabel={`Actions for ${member.name}`}
        />
      }
      dropdown={
        <Column fillWidth padding="4" gap="2">
          <Option
            value="role"
            label="Change role"
            onClick={() => onChangeRole(member)}
          />
          {member.status === "Invited" && (
            <Option
              value="resend"
              label="Resend invite"
              onClick={() => onResend(member)}
            />
          )}
          <Option
            value="remove"
            label="Remove"
            danger
            onClick={() => onRemove(member)}
          />
        </Column>
      }
    />
  );
}
