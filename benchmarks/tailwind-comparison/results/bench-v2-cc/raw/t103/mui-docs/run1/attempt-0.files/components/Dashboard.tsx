"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { formatDate, projects, user } from "@/lib/data";

export default function Dashboard() {
  const theme = useTheme();
  const active = projects.filter((p) => p.status === "Active").length;
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const cards = [
    { label: "Open issues", value: open, hint: "across all projects" },
    { label: "Active projects", value: active, hint: `of ${projects.length} total` },
    { label: "Paused", value: projects.filter((p) => p.status === "Paused").length, hint: "waiting on a decision" },
    { label: "Archived", value: projects.filter((p) => p.status === "Archived").length, hint: "read only" },
  ];

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {active} projects are active and {open} issues are open at Acme Labs.
      </Typography>

      <Grid container spacing={2} component="section" aria-label="Summary">
        {cards.map((c) => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {c.label}
                </Typography>
                <Typography variant="h2" component="p" sx={{ my: 0.5 }}>
                  {c.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.hint}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Open issues by project
              </Typography>
              <Box role="img" aria-label={`Bar chart of open issues: ${projects.map((p) => `${p.key} ${p.issues}`).join(", ")}`}>
                <BarChart
                  height={260}
                  colors={[theme.palette.primary.main]}
                  xAxis={[{ scaleType: "band", data: projects.map((p) => p.key) }]}
                  series={[{ data: projects.map((p) => p.issues), label: "Open issues" }]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card id="reports" sx={{ height: "100%", scrollMarginTop: 80 }}>
            <CardContent>
              <Typography variant="h5" component="h2">
                Reports: recent activity
              </Typography>
              <List disablePadding>
                {latest.map((p, i) => (
                  <Box key={p.key}>
                    {i > 0 && <Divider component="li" />}
                    <ListItem disableGutters secondaryAction={<Chip size="small" label={p.status} variant="outlined" />}>
                      <ListItemText
                        primary={`${p.key}: ${p.name}`}
                        secondary={`Updated ${formatDate(p.updated)}`}
                        sx={{ pr: 10 }}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
