"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import { user } from "@/lib/data";

interface Notifications {
  digest: boolean;
  assigned: boolean;
  status: boolean;
}

const initialNotifications: Notifications = { digest: true, assigned: true, status: false };

export default function SettingsView() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notifications, setNotifications] = useState<Notifications>(initialNotifications);
  const [saved, setSaved] = useState(false);

  const touch = () => setSaved(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  const handleReset = () => {
    setName(user.name);
    setEmail(user.email);
    setNotifications(initialNotifications);
    setSaved(false);
  };

  return (
    <>
      <PageHeader title="Settings" description="Your profile and how Lumen contacts you." />

      <Box component="form" onSubmit={handleSubmit} onReset={handleReset} noValidate>
        <Card component="section" aria-labelledby="profile-heading">
          <CardContent>
            <Typography id="profile-heading" variant="h3" component="h2" sx={{ mb: 1 }}>
              Profile
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="settings-name"
                  label="Full name"
                  fullWidth
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    touch();
                  }}
                  autoComplete="name"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="settings-email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    touch();
                  }}
                  autoComplete="email"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="settings-role"
                  label="Role"
                  fullWidth
                  value={user.role}
                  helperText="Only another owner can change your role."
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card component="section" aria-labelledby="notifications-heading" sx={{ mt: 1.5 }}>
          <CardContent>
            <Typography id="notifications-heading" variant="h3" component="h2" sx={{ mb: 0.5 }}>
              Notifications
            </Typography>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend" sx={{ position: "absolute", left: -9999 }}>
                Email notifications
              </FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.digest}
                      onChange={(event) => {
                        setNotifications((prev) => ({ ...prev, digest: event.target.checked }));
                        touch();
                      }}
                    />
                  }
                  label="Weekly summary email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.assigned}
                      onChange={(event) => {
                        setNotifications((prev) => ({ ...prev, assigned: event.target.checked }));
                        touch();
                      }}
                    />
                  }
                  label="Email me when an issue is assigned to me"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.status}
                      onChange={(event) => {
                        setNotifications((prev) => ({ ...prev, status: event.target.checked }));
                        touch();
                      }}
                    />
                  }
                  label="Email me when a project is paused or archived"
                />
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1.5 }}>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
          <Button type="reset" variant="outlined" color="secondary">
            Reset
          </Button>
          {saved && (
            <Alert severity="success" variant="outlined" role="status" sx={{ py: 0 }}>
              Settings saved.
            </Alert>
          )}
        </Box>
      </Box>
    </>
  );
}
