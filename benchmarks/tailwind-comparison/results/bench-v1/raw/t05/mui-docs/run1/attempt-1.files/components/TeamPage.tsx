"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import { MEMBERS, ROLES, PRODUCT_NAME, WORKSPACE_NAME } from "@/lib/data";
import type { Member, Role } from "@/lib/data";
import { RoleBadge, StatusBadge } from "@/components/badges";
import MemberAvatar from "@/components/MemberAvatar";
import MemberActionsMenu from "@/components/MemberActionsMenu";
import AppLink from "@/components/AppLink";
import InviteDialog from "@/components/InviteDialog";
import type { InvitePayload } from "@/components/InviteDialog";
import ChangeRoleDialog from "@/components/ChangeRoleDialog";

type RoleFilter = "All" | Role;

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

export default function TeamPage() {
  const [members, setMembers] = React.useState<Member[]>(MEMBERS);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("All");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [roleTarget, setRoleTarget] = React.useState<Member | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesRole = roleFilter === "All" || m.role === roleFilter;
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  const handleInvite = (payload: InvitePayload) => {
    const next: Member = {
      id: `m-new-${members.length + 1}`,
      name: nameFromEmail(payload.email),
      email: payload.email,
      role: payload.role,
      status: "Invited",
      joined: null,
    };
    setMembers((prev) => [...prev, next]);
    setInviteOpen(false);
    setToast(`Invitation sent to ${payload.email}`);
  };

  const handleSaveRole = (member: Member, role: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    setRoleTarget(null);
    setToast(`${member.name} is now ${role}`);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 3 }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            {PRODUCT_NAME} · {WORKSPACE_NAME}
          </Typography>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Team
          </Typography>
          <Typography color="text.secondary">
            Manage who can see and change your analytics and issues.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteOpen(true)}
        >
          Invite member
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search members"
          placeholder="Search by name or email"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, maxWidth: { sm: 420 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Role"
          size="small"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          sx={{ minWidth: { sm: 180 } }}
        >
          <MenuItem value="All">All roles</MenuItem>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        role="status"
        aria-live="polite"
        sx={{ mb: 1 }}
      >
        Showing {filtered.length} of {members.length} members
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Team members">
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Status</TableCell>
              <TableCell align="right" sx={{ width: 56 }}>
                <Box component="span" sx={visuallyHidden}>
                  Actions
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell component="th" scope="row">
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <MemberAvatar id={m.id} name={m.name} />
                    <Box sx={{ minWidth: 0 }}>
                      <AppLink
                        href={`/members/${m.id}`}
                        underline="hover"
                        color="text.primary"
                        sx={{ fontWeight: 600 }}
                      >
                        {m.name}
                      </AppLink>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ display: { xs: "block", md: "none" }, maxWidth: 200 }}
                      >
                        {m.email}
                      </Typography>
                      <Box sx={{ display: { xs: "block", sm: "none" }, mt: 0.5 }}>
                        <StatusBadge status={m.status} />
                      </Box>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {m.email}
                </TableCell>
                <TableCell>
                  <RoleBadge role={m.role} />
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <StatusBadge status={m.status} />
                </TableCell>
                <TableCell align="right">
                  <MemberActionsMenu
                    member={m}
                    onChangeRole={setRoleTarget}
                    onResend={(member) => setToast(`Invitation resent to ${member.email}`)}
                    onRemove={(member) => {
                      setMembers((prev) => prev.filter((x) => x.id !== member.id));
                      setToast(`${member.name} was removed from the team`);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 600 }}>No members match your filters</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Try a different name or email, or reset the role filter.
                  </Typography>
                  <Button
                    onClick={() => {
                      setQuery("");
                      setRoleFilter("All");
                    }}
                  >
                    Clear filters
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        existingEmails={members.map((m) => m.email.toLowerCase())}
      />
      <ChangeRoleDialog
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSave={handleSaveRole}
      />
      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Container>
  );
}
