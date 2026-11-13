"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PageHeader from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [notify, setNotify] = React.useState({
    assigned: true,
    digest: true,
    releases: false,
  });
  const [saved, setSaved] = React.useState(false);

  return (
    <>
      <PageHeader title="Settings" description="Your profile, appearance and notifications." />

      <Box
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          setSaved(true);
        }}
        sx={{ display: "grid", gap: 3, maxWidth: 720 }}
      >
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Typography id="profile-heading" variant="h6" component="h2">
              Profile
            </Typography>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={user.email} fullWidth slotProps={{ input: { readOnly: true } }} />
            <TextField label="Role" value={user.role} fullWidth disabled />
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="appearance-heading">
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Typography id="appearance-heading" variant="h6" component="h2">
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              aria-label="Color theme"
              value={mode ?? "dark"}
              onChange={(_, value: "light" | "dark" | "system" | null) => {
                if (value) setMode(value);
              }}
            >
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notify-heading">
          <CardContent sx={{ display: "grid", gap: 1 }}>
            <Typography id="notify-heading" variant="h6" component="h2">
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.assigned}
                    onChange={(e) => setNotify((n) => ({ ...n, assigned: e.target.checked }))}
                  />
                }
                label="Email me when an issue is assigned to me"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.digest}
                    onChange={(e) => setNotify((n) => ({ ...n, digest: e.target.checked }))}
                  />
                }
                label="Send a weekly project digest"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.releases}
                    onChange={(e) => setNotify((n) => ({ ...n, releases: e.target.checked }))}
                  />
                }
                label="Announce product releases"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Box>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
        </Box>
      </Box>

      <Snackbar open={saved} autoHideDuration={4000} onClose={() => setSaved(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Settings saved.
        </Alert>
      </Snackbar>
    </>
  );
}
