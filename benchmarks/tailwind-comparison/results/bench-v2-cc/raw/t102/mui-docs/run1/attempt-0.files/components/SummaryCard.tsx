import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface SummaryCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export default function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" component="p" sx={{ mt: 1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hint}
            </Typography>
          </Box>
          <Box
            aria-hidden
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.selected",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
