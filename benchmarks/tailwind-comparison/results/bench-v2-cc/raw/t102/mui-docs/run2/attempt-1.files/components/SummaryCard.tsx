import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type SummaryCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

export default function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography component="h2" variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h3" component="p" sx={{ fontSize: "2.5rem" }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}
