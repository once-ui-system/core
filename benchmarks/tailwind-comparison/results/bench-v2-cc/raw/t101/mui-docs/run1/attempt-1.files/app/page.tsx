import { Fragment } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { formatDate, projects, user } from "@/lib/data";

const open = projects.reduce((n, p) => n + p.issues, 0);
const stats = [
  { label: "Active projects", value: projects.filter((p) => p.status === "Active").length },
  { label: "Open issues", value: open },
  { label: "Paused projects", value: projects.filter((p) => p.status === "Paused").length },
  { label: "Archived projects", value: projects.filter((p) => p.status === "Archived").length },
];

const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

export default function Page() {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Here is where your workspace stands across {projects.length} projects.
      </Typography>

      <Grid container spacing={1.5} component="section" aria-label="Summary">
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h2" component="p" sx={{ mt: 0.5 }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 1.5 }}>
        <CardContent>
          <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
            Recently updated
          </Typography>
          {recent.map((p, i) => (
            <Fragment key={p.key}>
              {i > 0 && <Divider />}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace", width: 40 }}>
                  {p.key}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {p.name}
                </Typography>
                <Chip label={p.status} variant="outlined" color={p.status === "Active" ? "primary" : "default"} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(p.updated)}
                </Typography>
              </Box>
            </Fragment>
          ))}
          <Box sx={{ mt: 1 }}>
            <Link component={NextLink} href="/projects" variant="body2">
              View all projects
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
