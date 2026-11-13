"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Your profile, notifications and appearance.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          setSaved(true);
        }}
        sx={{ display: "grid", gap: 3, maxWidth: 720 }}
      >
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent sx={{ display: "grid", gap: 3 }}>
            <Typography id="profile-heading" variant="h4" component="h2">
              Profile
            </Typography>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField label="Role" value={user.role} fullWidth disabled helperText="Only workspace owners can change roles." />
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notify-heading">
          <CardContent sx={{ display: "grid", gap: 1 }}>
            <Typography id="notify-heading" variant="h4" component="h2">
              Notifications
            </Typography>
            <FormControlLabel
              control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
              label="Weekly digest of project activity"
              sx={{ py: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
              label="Email me when I am mentioned"
              sx={{ py: 1 }}
            />
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="appearance-heading">
          <CardContent sx={{ display: "grid", gap: 3 }}>
            <Typography id="appearance-heading" variant="h4" component="h2">
              Appearance
            </Typography>
            <TextField
              select
              label="Theme"
              value={mode ?? "light"}
              onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
              fullWidth
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">Match my device</MenuItem>
            </TextField>
          </CardContent>
        </Card>

        <Box>
          <Button type="submit" variant="contained" size="large">
            Save changes
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={() => setSaved(false)}
        message="Settings saved"
      />
    </Box>
  );
}
