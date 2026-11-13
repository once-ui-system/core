import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Recently updated projects
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {recentProjects.map((p) => (
              <Box
                component="li"
                key={p.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 1.5,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography>
                    {p.name} ({p.key})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {p.issues} open issues · updated {formatDate(p.updated)}
                  </Typography>
                </Box>
                <StatusChip status={p.status} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
