import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom={Boolean(description)}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions}
    </Box>
  );
}
