import Typography from "@mui/material/Typography";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings | Lumen" };

export default function SettingsPage() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile and how Lumen keeps you informed.
      </Typography>
      <SettingsForm />
    </>
  );
}
