import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { issueLabel, type Project } from "@/lib/data";

export default function ProjectBars({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => b.issues - a.issues);
  const max = Math.max(1, ...sorted.map((project) => project.issues));

  return (
    <Box
      component="ul"
      sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 3 }}
    >
      {sorted.map((project) => (
        <li key={project.key}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="subtitle1">{project.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {issueLabel(project.issues)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(project.issues / max) * 100}
            aria-label={`${project.name} open issues`}
            aria-valuetext={issueLabel(project.issues)}
          />
        </li>
      ))}
    </Box>
  );
}
