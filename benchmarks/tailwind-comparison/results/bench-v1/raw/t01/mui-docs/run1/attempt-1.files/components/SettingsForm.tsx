"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";

export default function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [weekly, setWeekly] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [releases, setReleases] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  const markDirty = () => setSaved(false);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3} sx={{ maxWidth: 640 }}>
        <Card variant="outlined" component="section" aria-labelledby="profile-heading">
          <CardContent>
            <Typography variant="h6" component="h2" id="profile-heading" gutterBottom>
              Profile
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  markDirty();
                }}
                fullWidth
                autoComplete="name"
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  markDirty();
                }}
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Role"
                value={user.role}
                fullWidth
                disabled
                helperText="Only another owner can change your role."
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          component="section"
          aria-labelledby="notifications-heading"
        >
          <CardContent>
            <Typography
              variant="h6"
              component="h2"
              id="notifications-heading"
              gutterBottom
            >
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={weekly}
                    onChange={(e) => {
                      setWeekly(e.target.checked);
                      markDirty();
                    }}
                  />
                }
                label="Weekly summary email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={mentions}
                    onChange={(e) => {
                      setMentions(e.target.checked);
                      markDirty();
                    }}
                  />
                }
                label="Notify me when I am mentioned on an issue"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={releases}
                    onChange={(e) => {
                      setReleases(e.target.checked);
                      markDirty();
                    }}
                  />
                }
                label="Release announcements"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
          <Box role="status" aria-live="polite">
            {saved && (
              <Alert severity="success" sx={{ py: 0 }}>
                Settings saved.
              </Alert>
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
