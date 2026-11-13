import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

export default function AlertChips({
  alerts,
  size = "small",
}: {
  alerts: string[];
  size?: "small" | "medium";
}) {
  if (alerts.length === 0) return null;
  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ flexWrap: "wrap", gap: 0.5 }}
      role="group"
      aria-label={`Medical alerts: ${alerts.join("; ")}`}
    >
      {alerts.map((a) => (
        <Chip
          key={a}
          size={size}
          color="error"
          icon={<ReportProblemIcon />}
          label={a}
          sx={{ fontWeight: 700, height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 } }}
        />
      ))}
    </Stack>
  );
}
