"use client";

import { Dropdown, IconButton, Option } from "@once-ui-system/core";
import type { Member } from "@/lib/data";

export type MemberAction = "change-role" | "resend" | "remove";

export function MemberActions({
  member,
  onAction,
}: {
  member: Member;
  onAction: (action: MemberAction, member: Member) => void;
}) {
  return (
    <Dropdown
      placement="bottom-end"
      minWidth={13}
      onSelect={(value) => onAction(value as MemberAction, member)}
      trigger={
        <IconButton
          icon="moreHorizontal"
          variant="tertiary"
          size="s"
          aria-label={`Actions for ${member.name}`}
          tooltip="Actions"
        />
      }
    >
      <Option value="change-role" label="Change role" prefix={<span aria-hidden />} />
      {member.status === "Invited" && <Option value="resend" label="Resend invite" />}
      <Option value="remove" label="Remove" danger />
    </Dropdown>
  );
}
