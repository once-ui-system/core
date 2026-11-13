import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, type Role, type Status } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  const variant = role === "Owner" ? "default" : role === "Admin" ? "secondary" : "outline";
  return <Badge variant={variant}>{role}</Badge>;
}

export function StatusBadge({ status }: { status: Status }) {
  if (status === "Active") {
    return (
      <Badge variant="secondary">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
        Active
      </Badge>
    );
  }
  if (status === "Invited") {
    return (
      <Badge variant="outline">
        <span aria-hidden="true" className="size-1.5 rounded-full border border-muted-foreground" />
        Invited
      </Badge>
    );
  }
  return <Badge variant="destructive">Suspended</Badge>;
}

export function MemberAvatar({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={cn(className)}>
      <AvatarFallback aria-hidden="true">{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
