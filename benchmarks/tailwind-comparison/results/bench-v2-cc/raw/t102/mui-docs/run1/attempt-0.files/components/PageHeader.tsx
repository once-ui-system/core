import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 5 } }}>
      <Typography variant="h1">{title}</Typography>
      {description ? (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
          {description}
        </Typography>
      ) : null}
    </Stack>
  );
}
