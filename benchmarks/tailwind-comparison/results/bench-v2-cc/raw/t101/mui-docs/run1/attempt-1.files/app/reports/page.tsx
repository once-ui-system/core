import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { projects } from "@/lib/data";

const max = Math.max(...projects.map((p) => p.issues));

export default function Page() {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Reports
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Open issues by project.
      </Typography>
      <Card>
        <CardContent>
          {projects.map((p) => (
            <Box key={p.key} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
              <Typography variant="body2" sx={{ width: { xs: 110, sm: 160 }, flexShrink: 0 }}>
                {p.name}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(p.issues / max) * 100}
                aria-label={`${p.name}: ${p.issues} open issues`}
                sx={{ flexGrow: 1, height: 6 }}
              />
              <Typography variant="body2" sx={{ width: 24, textAlign: "right" }}>
                {p.issues}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
