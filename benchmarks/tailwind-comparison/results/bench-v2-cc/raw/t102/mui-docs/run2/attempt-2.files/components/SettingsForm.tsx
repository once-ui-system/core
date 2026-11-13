"use client";

import { useState, type FormEvent } from "react";
import { useColorScheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { user } from "@/lib/data";

type Mode = "light" | "dark" | "system";

export default function SettingsForm() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notify, setNotify] = useState({ digest: true, mentions: true, assigned: false });
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <Stack component="form" spacing={3} onSubmit={onSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Profile
          </Typography>
          <Stack spacing={3} sx={{ maxWidth: 520 }}>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField label="Role" value={user.role} disabled helperText="Only another owner can change this." />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1, color: "text.primary", fontFamily: "inherit" }}>
              <Typography variant="h5" component="span">
                Appearance
              </Typography>
            </FormLabel>
            <RadioGroup
              row
              aria-label="Colour theme"
              value={(mode ?? "light") as Mode}
              onChange={(event) => setMode(event.target.value as Mode)}
            >
              <FormControlLabel value="light" control={<Radio />} label="Light" sx={{ mr: 4 }} />
              <FormControlLabel value="dark" control={<Radio />} label="Dark" sx={{ mr: 4 }} />
              <FormControlLabel value="system" control={<Radio />} label="Match my device" />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1, color: "text.primary" }}>
              <Typography variant="h5" component="span">
                Notifications
              </Typography>
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.digest}
                    onChange={(e) => setNotify((n) => ({ ...n, digest: e.target.checked }))}
                  />
                }
                label="Weekly digest email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.mentions}
                    onChange={(e) => setNotify((n) => ({ ...n, mentions: e.target.checked }))}
                  />
                }
                label="When someone mentions me"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notify.assigned}
                    onChange={(e) => setNotify((n) => ({ ...n, assigned: e.target.checked }))}
                  />
                }
                label="When an issue is assigned to me"
              />
            </FormGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Stack direction="row" sx={{ justifyContent: "flex-start" }}>
        <Button type="submit" variant="contained" size="large">
          Save changes
        </Button>
      </Stack>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)} sx={{ width: "100%" }}>
          Settings saved. Looking good!
        </Alert>
      </Snackbar>
    </Stack>
  );
}
