"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import { useColorScheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";

export default function Page() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [role, setRole] = React.useState(user.role);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Manage your profile, notifications and appearance.
      </Typography>

      <Box sx={{ display: "grid", gap: 1.5, maxWidth: 640 }}>
        <Card component="section" aria-labelledby="profile-h">
          <CardContent>
            <Typography id="profile-h" variant="h3" component="h2" sx={{ mb: 1.5 }}>
              Profile
            </Typography>
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                setSaved(true);
              }}
              sx={{ display: "grid", gap: 1.5 }}
            >
              <TextField
                label="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                fullWidth
              />
              <TextField label="Email" value={user.email} fullWidth slotProps={{ input: { readOnly: true } }} />
              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setSaved(false);
                }}
                fullWidth
              >
                {["Owner", "Admin", "Member"].map((r) => (
                  <MenuItem key={r} value={r} dense>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button type="submit" variant="contained">
                  Save changes
                </Button>
                {saved && (
                  <Alert severity="success" role="status" sx={{ py: 0 }}>
                    Profile saved.
                  </Alert>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notif-h">
          <CardContent>
            <Typography id="notif-h" variant="h3" component="h2" sx={{ mb: 1 }}>
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
                label="Weekly digest email"
              />
              <FormControlLabel
                control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
                label="Notify me when I am mentioned"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="look-h">
          <CardContent>
            <Typography id="look-h" variant="h3" component="h2" sx={{ mb: 1 }}>
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={mode ?? "light"}
              onChange={(_, v: "light" | "dark" | "system" | null) => {
                if (v) setMode(v);
              }}
              aria-label="Color theme"
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
