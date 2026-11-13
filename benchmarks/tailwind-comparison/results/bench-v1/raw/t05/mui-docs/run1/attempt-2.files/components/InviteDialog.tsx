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
