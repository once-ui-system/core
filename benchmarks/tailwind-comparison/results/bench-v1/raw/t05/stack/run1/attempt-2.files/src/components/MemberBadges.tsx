import { Badge } from "@once-ui-system/core";
import { type Role, type Status, roleScheme, statusScheme } from "@/lib/team";

/**
 * Badge has no colour scheme prop, so the scheme is applied through
 * background / on-background tokens on the badge itself.
 */
export function RoleBadge({ role }: { role: Role }) {
  const scheme = roleScheme[role];
  return (
    <Badge
      effect={false}
      background={`${scheme}-alpha-weak`}
      onBackground={`${scheme}-strong`}
      border={`${scheme}-alpha-medium`}
      paddingX="8"
      paddingY="4"
      textVariant="label-default-xs"
    >
      {role}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const scheme = statusScheme[status];
  return (
    <Badge
      effect={false}
      icon={status === "Active" ? "check" : status === "Invited" ? "mail" : "lock"}
      background={`${scheme}-alpha-weak`}
      onBackground={`${scheme}-strong`}
      border={`${scheme}-alpha-medium`}
      paddingX="8"
      paddingY="4"
      textVariant="label-default-xs"
    >
      {status}
    </Badge>
  );
}
