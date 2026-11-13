import Typography from "@mui/material/Typography";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings | Lumen" };

export default function Page() {
  return (
    <>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Your profile, notifications and appearance.
      </Typography>
      <SettingsForm />
    </>
  );
}
