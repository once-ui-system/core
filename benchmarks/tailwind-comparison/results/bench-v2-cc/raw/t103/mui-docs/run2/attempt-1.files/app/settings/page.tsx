"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [saved, setSaved] = React.useState(false);
  const [notify, setNotify] = React.useState({ assigned: true, digest: true, product: false });

  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile, appearance and notifications.
      </Typography>

      <Box sx={{ display: "grid", gap: 3, maxWidth: 720 }}>
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              setSaved(true);
            }}
            sx={{ display: "grid", gap: 2 }}
          >
            <Typography id="profile-heading" variant="h4" component="h2">
              Profile
            </Typography>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              autoComplete="name"
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              autoComplete="email"
              fullWidth
            />
            <TextField label="Role" value={user.role} disabled fullWidth />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Button type="submit" variant="contained">
                Save changes
              </Button>
              {saved && (
                <Alert severity="success" role="status" sx={{ py: 0 }}>
                  Profile saved.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="appearance-heading">
          <CardContent sx={{ display: "grid", gap: 2 }}>
            <Typography id="appearance-heading" variant="h4" component="h2">
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={mode ?? null}
              onChange={(_, value) => {
                if (value) setMode(value);
              }}
              aria-label="Color mode"
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notify-heading">
          <CardContent sx={{ display: "grid", gap: 1 }}>
            <Typography id="notify-heading" variant="h4" component="h2">
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
                    checked={notify.product}
                    onChange={(e) => setNotify((n) => ({ ...n, product: e.target.checked }))}
                  />
                }
                label="Product updates and release notes"
              />
            </FormGroup>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
