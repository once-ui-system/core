import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import StatusChip from "@/components/StatusChip";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";

export default function DashboardView() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues },
    { label: "Active projects", value: activeProjects },
    { label: "Active members", value: activeMembers },
    { label: "Pending invites", value: pendingInvites },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Good to see you, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Here is how your workspace is doing. Press Ctrl+K (Cmd+K on a Mac) to jump anywhere.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        }}
      >
        {stats.map((s) => (
          <Card key={s.label} variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {s.label}
              </Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 700, mt: 0.5 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2">
            Recently updated projects
          </Typography>
          <List disablePadding>
            {recentProjects.map((p) => (
              <ListItem
                key={p.key}
                disableGutters
                divider
                secondaryAction={<StatusChip status={p.status} />}
                sx={{ pr: 12 }}
              >
                <ListItemText
                  primary={`${p.name} (${p.key})`}
                  secondary={`${p.issues} open issues · updated ${formatDate(p.updated)}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
