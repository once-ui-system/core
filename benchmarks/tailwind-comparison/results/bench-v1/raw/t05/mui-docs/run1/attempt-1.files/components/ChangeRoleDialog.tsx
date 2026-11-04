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
