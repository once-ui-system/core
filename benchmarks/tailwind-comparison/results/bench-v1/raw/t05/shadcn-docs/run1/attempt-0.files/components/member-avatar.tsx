import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/data";
import { cn } from "@/lib/utils";

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
