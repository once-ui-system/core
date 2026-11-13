import { InviteMemberButton } from "@/components/action-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, initials, members } from "@/lib/data";

export function MembersView() {
  return (
    <>
      <PageHeader
        title="Members"
        description={`${members.length} people on the Acme Labs team.`}
        actions={<InviteMemberButton />}
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <caption className="sr-only">Members of the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground">
                  {formatDate(member.joined)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
