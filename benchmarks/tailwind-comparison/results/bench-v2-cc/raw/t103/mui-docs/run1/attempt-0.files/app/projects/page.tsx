import Typography from "@mui/material/Typography";
import ProjectsTable from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata = { title: "Projects | Lumen" };

export default function Page() {
  return (
    <>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Every project in the Acme Labs workspace, with its open issue count.
      </Typography>
      <ProjectsTable rows={projects} />
    </>
  );
}
