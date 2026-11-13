"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PageHeading from "@/components/PageHeading";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { mode, setMode } = useColorScheme();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);
  const [releases, setReleases] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <Box>
      <PageHeading title="Settings" subtitle="Your profile, notifications and appearance." />
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: "grid", gap: 2, maxWidth: 640 }}
        aria-label="Settings"
      >
        <Card>
          <CardHeader title={<Typography variant="h5" component="h2">Profile</Typography>} />
          <Divider />
          <CardContent sx={{ display: "grid", gap: 1.5 }}>
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="Role" value={user.role} fullWidth disabled helperText="Only another owner can change roles." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<Typography variant="h5" component="h2">Notifications</Typography>} />
          <Divider />
          <CardContent>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
                label="Weekly analytics digest"
              />
              <FormControlLabel
                control={<Switch checked={mentions} onChange={(e) => setMentions(e.target.checked)} />}
                label="Email me when I am mentioned on an issue"
              />
              <FormControlLabel
                control={<Switch checked={releases} onChange={(e) => setReleases(e.target.checked)} />}
                label="Product release notes"
              />
            </FormGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={<Typography variant="h5" component="h2">Appearance</Typography>} />
          <Divider />
          <CardContent>
            <TextField
              select
              label="Theme"
              value={mode ?? "light"}
              onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
              sx={{ width: { xs: "100%", sm: 240 } }}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">Match system</MenuItem>
            </TextField>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" variant="contained">
            Save changes
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Settings saved"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </Box>
  );
}
