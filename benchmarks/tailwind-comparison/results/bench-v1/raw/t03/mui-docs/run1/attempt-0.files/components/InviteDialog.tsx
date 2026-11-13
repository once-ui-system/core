"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInvited: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteDialog({ open, onClose, onInvited }: InviteDialogProps) {
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const invalid = touched && !EMAIL_PATTERN.test(email.trim());

  const reset = () => {
    setEmail("");
    setTouched(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) return;
    onInvited(value);
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="invite-dialog-title"
      slotProps={{ transition: { onExited: reset } }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="invite-dialog-title">Invite a member</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            They will get an email with a link to join your Lumen workspace as a Member.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            required
            id="invite-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            error={invalid}
            helperText={invalid ? "Enter a valid email address, like name@acmelabs.io" : " "}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Send invite
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function InviteSuccess({ email }: { email: string }) {
  return <Alert severity="success">Invitation sent to {email}</Alert>;
}
