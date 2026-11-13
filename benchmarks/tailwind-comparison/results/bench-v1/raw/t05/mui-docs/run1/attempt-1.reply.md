The config is plain. The most likely cause of the failed start is the server components passing functions across the client boundary, or the Dialog transition prop types. I'm fixing both and sending every file.

```ts lib/data.ts
export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";
export const WORKSPACE_NAME = "Acme Labs";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const MEMBERS: Member[] = [
  {
    id: "m-01",
    name: "Maya Okafor",
    email: "maya@acmelabs.io",
    role: "Owner",
    status: "Active",
    joined: "2024-03-02",
  },
  {
    id: "m-02",
    name: "Daniel Reyes",
    email: "daniel@acmelabs.io",
    role: "Admin",
    status: "Active",
    joined: "2024-05-19",
  },
  {
    id: "m-03",
    name: "Priya Natarajan",
    email: "priya@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2024-11-07",
  },
  {
    id: "m-04",
    name: "Tomás Lindqvist",
    email: "tomas@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2025-02-14",
  },
  {
    id: "m-05",
    name: "Hana Sato",
    email: "hana@acmelabs.io",
    role: "Member",
    status: "Invited",
    joined: null,
  },
  {
    id: "m-06",
    name: "Grace Mensah",
    email: "grace@acmelabs.io",
    role: "Viewer",
    status: "Active",
    joined: "2025-06-30",
  },
  {
    id: "m-07",
    name: "Leo Brandt",
    email: "leo@acmelabs.io",
    role: "Member",
    status: "Suspended",
    joined: "2025-01-21",
  },
  {
    id: "m-08",
    name: "Ines Duarte",
    email: "ines@acmelabs.io",
    role: "Viewer",
    status: "Invited",
    joined: null,
  },
];

const ACTIVITY: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      id: "a1",
      action: "Updated billing plan to",
      target: "Team (10 seats)",
      when: "2 days ago",
    },
    {
      id: "a2",
      action: "Created dashboard",
      target: "Weekly activation funnel",
      when: "4 days ago",
    },
    {
      id: "a3",
      action: "Changed role of Daniel Reyes to",
      target: "Admin",
      when: "3 weeks ago",
    },
  ],
  "m-02": [
    {
      id: "a1",
      action: "Closed issue",
      target: "LUM-214 Funnel chart drops last day of data",
      when: "3 hours ago",
    },
    {
      id: "a2",
      action: "Created segment",
      target: "Trial users, last 14 days",
      when: "Yesterday",
    },
    {
      id: "a3",
      action: "Commented on",
      target: "LUM-231 Slack alerts fire twice",
      when: "2 days ago",
    },
    {
      id: "a4",
      action: "Invited Hana Sato as",
      target: "Member",
      when: "5 days ago",
    },
    {
      id: "a5",
      action: "Connected integration",
      target: "GitHub (acme-labs/web)",
      when: "2 weeks ago",
    },
  ],
  "m-03": [
    {
      id: "a1",
      action: "Opened issue",
      target: "LUM-240 Retention cohort export is empty",
      when: "Yesterday",
    },
    {
      id: "a2",
      action: "Edited dashboard",
      target: "Onboarding health",
      when: "3 days ago",
    },
  ],
  "m-04": [
    {
      id: "a1",
      action: "Closed issue",
      target: "LUM-222 Event schema validation errors",
      when: "Today",
    },
    {
      id: "a2",
      action: "Merged pull request",
      target: "#418 Batch event ingestion",
      when: "2 days ago",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a1",
      action: "Viewed dashboard",
      target: "Weekly activation funnel",
      when: "Yesterday",
    },
  ],
  "m-07": [
    {
      id: "a1",
      action: "Account suspended by",
      target: "Maya Okafor",
      when: "6 days ago",
    },
    {
      id: "a2",
      action: "Opened issue",
      target: "LUM-198 Session replay stalls on Safari",
      when: "3 weeks ago",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
```

```tsx components/AppLink.tsx
"use client";

import NextLink from "next/link";
import MuiLink from "@mui/material/Link";
import type { LinkProps as MuiLinkProps } from "@mui/material/Link";

interface AppLinkProps extends Omit<MuiLinkProps, "href" | "component"> {
  href: string;
}

export default function AppLink({ href, children, ...rest }: AppLinkProps) {
  return (
    <MuiLink component={NextLink} href={href} {...rest}>
      {children}
    </MuiLink>
  );
}
```

```tsx components/LinkButton.tsx
"use client";

import NextLink from "next/link";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

interface LinkButtonProps extends Omit<ButtonProps, "href" | "component"> {
  href: string;
}

export default function LinkButton({ href, children, ...rest }: LinkButtonProps) {
  return (
    <Button component={NextLink} href={href} {...rest}>
      {children}
    </Button>
  );
}
```

```tsx components/badges.tsx
"use client";

import Chip from "@mui/material/Chip";
import type { Role, Status } from "@/lib/data";

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "error";

const ROLE_COLOR: Record<Role, ChipColor> = {
  Owner: "secondary",
  Admin: "primary",
  Member: "default",
  Viewer: "default",
};

const STATUS_COLOR: Record<Status, ChipColor> = {
  Active: "success",
  Invited: "warning",
  Suspended: "error",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Chip
      label={role}
      size="small"
      color={ROLE_COLOR[role]}
      variant={ROLE_COLOR[role] === "default" ? "outlined" : "filled"}
    />
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <Chip label={status} size="small" color={STATUS_COLOR[status]} variant="outlined" />;
}
```

```tsx components/MemberAvatar.tsx
"use client";

import Avatar from "@mui/material/Avatar";
import { getInitials } from "@/lib/data";

const PALETTE = [
  "#5E35B1",
  "#00897B",
  "#C2185B",
  "#1E88E5",
  "#EF6C00",
  "#546E7A",
  "#6D4C41",
  "#3949AB",
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return PALETTE[hash % PALETTE.length];
}

export default function MemberAvatar({
  id,
  name,
  size = 40,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  return (
    <Avatar
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        bgcolor: colorFor(id),
        color: "#fff",
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
}
```

```tsx components/InviteDialog.tsx
"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { ASSIGNABLE_ROLES, isValidEmail, type Role } from "@/lib/data";

export interface InvitePayload {
  email: string;
  role: Role;
  message: string;
}

interface Errors {
  email?: string;
  role?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePayload) => void;
  existingEmails: string[];
}

export default function InviteDialog({ open, onClose, onInvite, existingEmails }: Props) {
  const uid = React.useId();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role | "">("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});

  const reset = () => {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter an email address.";
    } else if (!isValidEmail(trimmed)) {
      next.email = "Enter a valid email address, like name@company.com.";
    } else if (existingEmails.includes(trimmed.toLowerCase())) {
      next.email = "This person is already on the team.";
    }
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0 || role === "") return;
    onInvite({ email: email.trim(), role, message: message.trim() });
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`${uid}-title`}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id={`${uid}-title`}>Invite a team member</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            They will get an email with a link to join your Lumen workspace.
          </DialogContentText>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Email address"
              type="email"
              name="email"
              autoComplete="off"
              autoFocus
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email ?? "Use their work email."}
            />
            <TextField
              select
              label="Role"
              name="role"
              required
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              error={Boolean(errors.role)}
              helperText={errors.role ?? "You can change this later."}
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Message (optional)"
              name="message"
              fullWidth
              multiline
              minRows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              helperText="Add a short note to include in the invitation."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              onClose();
              reset();
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Send invite
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

```tsx components/MemberActionsMenu.tsx
"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ManageAccountsIcon from "@mui/icons-material/ManageAccountsOutlined";
import SendIcon from "@mui/icons-material/SendOutlined";
import PersonRemoveIcon from "@mui/icons-material/PersonRemoveOutlined";
import type { Member } from "@/lib/data";

interface Props {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResend: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export default function MemberActionsMenu({ member, onChangeRole, onResend, onRemove }: Props) {
  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        id={buttonId}
        aria-label={`Actions for ${member.name}`}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ list: { "aria-labelledby": buttonId } }}
      >
        <MenuItem
          onClick={() => {
            close();
            onChangeRole(member);
          }}
        >
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change role</ListItemText>
        </MenuItem>
        {member.status === "Invited" && (
          <MenuItem
            onClick={() => {
              close();
              onResend(member);
            }}
          >
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resend invite</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            onRemove(member);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <PersonRemoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
```

```tsx components/ChangeRoleDialog.tsx
"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { ROLES, type Member, type Role } from "@/lib/data";

interface Props {
  member: Member | null;
  onClose: () => void;
  onSave: (member: Member, role: Role) => void;
}

export default function ChangeRoleDialog({ member, onClose, onSave }: Props) {
  const uid = React.useId();
  const [role, setRole] = React.useState<Role>("Member");

  React.useEffect(() => {
    if (member) setRole(member.role);
  }, [member]);

  return (
    <Dialog
      open={member !== null}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={`${uid}-title`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (member) onSave(member, role);
        }}
      >
        <DialogTitle id={`${uid}-title`}>
          {member ? `Change role for ${member.name}` : "Change role"}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            sx={{ mt: 1 }}
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save role
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

```tsx components/TeamPage.tsx
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
```

```tsx app/page.tsx
import TeamPage from "@/components/TeamPage";

export default function Page() {
  return <TeamPage />;
}
```

```tsx app/members/[id]/page.tsx
import * as React from "react";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppLink from "@/components/AppLink";
import MemberAvatar from "@/components/MemberAvatar";
import { RoleBadge, StatusBadge } from "@/components/badges";
import { MEMBERS, formatDate, getActivity, getMember } from "@/lib/data";

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ id: m.id }));
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" component="dt">
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 3 }}>
        <AppLink href="/" underline="hover" color="inherit">
          Team
        </AppLink>
        <Typography color="text.primary">{member.name}</Typography>
      </Breadcrumbs>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: { sm: "center" } }}
        >
          <MemberAvatar id={member.id} name={member.name} size={80} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {member.name}
            </Typography>
            <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
              {member.email}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          }}
        >
          <Field label="Role" value={member.role} />
          <Field label="Status" value={member.status} />
          <Field label="Joined" value={formatDate(member.joined)} />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Recent activity
        </Typography>
        {activity.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {member.status === "Invited"
              ? `${member.name} hasn't accepted the invitation yet, so there is no activity to show.`
              : "No recent activity."}
          </Typography>
        ) : (
          <List disablePadding sx={{ mt: 1 }}>
            {activity.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem disableGutters>
                  <ListItemText
                    primary={
                      <>
                        {item.action}{" "}
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {item.target}
                        </Box>
                      </>
                    }
                    secondary={item.when}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
```

```tsx app/members/[id]/not-found.tsx
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LinkButton from "@/components/LinkButton";

export default function NotFound() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        Member not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This person is not on your team, or they were removed.
      </Typography>
      <LinkButton href="/" variant="contained">
        Back to team
      </LinkButton>
    </Container>
  );
}
```