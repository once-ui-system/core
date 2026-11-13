import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: { xs: 4, md: 5 },
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.75rem" } }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
