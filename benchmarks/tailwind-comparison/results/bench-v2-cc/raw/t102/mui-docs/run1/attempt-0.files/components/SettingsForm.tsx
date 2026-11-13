"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import { user } from "@/lib/data";

type Pref = "weekly" | "assigned" | "mentions" | "product";

const prefLabels: { id: Pref; title: string; hint: string }[] = [
  { id: "weekly", title: "Weekly summary", hint: "A Monday note with what moved last week." },
  { id: "assigned", title: "Issues assigned to me", hint: "Hear about it as soon as something lands on you." },
  { id: "mentions", title: "Mentions and replies", hint: "When a teammate tags you in a thread." },
  { id: "product", title: "Product news", hint: "New features and tips from the Lumen team." },
];

type Mode = "light" | "dark" | "system";

export default function SettingsForm() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [prefs, setPrefs] = useState<Record<Pref, boolean>>({
    weekly: true,
    assigned: true,
    mentions: true,
    product: false,
  });
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 760 }}
    >
      <Card component="section" aria-labelledby="profile-heading">
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography id="profile-heading" variant="h5" component="h2" sx={{ mb: 3 }}>
            Profile
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              fullWidth
              required
            />
            <TextField
              label="Role"
              value={user.role}
              helperText="Roles are managed by the workspace owner."
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
          </Stack>
        </CardContent>
      </Card>

      <Card component="section" aria-labelledby="appearance-heading">
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography id="appearance-heading" variant="h5" component="h2" sx={{ mb: 1 }}>
            Appearance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose how Lumen looks for you.
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={mode ?? "light"}
            onChange={(_, value: Mode | null) => {
              if (value) setMode(value);
            }}
            aria-label="Colour mode"
          >
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
            <ToggleButton value="system">System</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      <Card component="section" aria-labelledby="notifications-heading">
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography id="notifications-heading" variant="h5" component="h2" sx={{ mb: 2 }}>
            Notifications
          </Typography>
          <Stack>
            {prefLabels.map((pref) => (
              <FormControlLabel
                key={pref.id}
                labelPlacement="start"
                sx={{ mx: 0, py: 1.5, width: "100%", justifyContent: "space-between", gap: 2 }}
                control={
                  <Switch
                    checked={prefs[pref.id]}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, [pref.id]: event.target.checked }))
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">{pref.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pref.hint}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Button type="submit" variant="contained" size="large">
          Save changes
        </Button>
      </Box>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSaved(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          Your settings are saved.
        </Alert>
      </Snackbar>
    </Box>
  );
}
