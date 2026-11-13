import Typography from "@mui/material/Typography";
import ProjectsTable from "@/components/ProjectsTable";

export const metadata = { title: "Projects | Lumen" };

export default function ProjectsPage() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Every project in the Acme Labs workspace and where its issues stand.
      </Typography>
      <ProjectsTable />
    </>
  );
}
