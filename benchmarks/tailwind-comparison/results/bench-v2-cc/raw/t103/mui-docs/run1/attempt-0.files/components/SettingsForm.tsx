"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "@/lib/data";

export default function SettingsForm() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
      }}
      sx={{ maxWidth: 720 }}
    >
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Profile
            </Typography>
            <Stack spacing={2}>
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField label="Role" value={user.role} fullWidth disabled helperText="Only an owner can change roles." />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
                label="Weekly analytics digest"
              />
              <FormControlLabel
                control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
                label="Email me when I am mentioned on an issue"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Appearance
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              aria-label="Color mode"
              value={mode ?? null}
              onChange={(_, value) => value && setMode(value)}
            >
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="system">System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Box>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
        </Box>
      </Stack>
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Settings saved"
      />
    </Box>
  );
}
