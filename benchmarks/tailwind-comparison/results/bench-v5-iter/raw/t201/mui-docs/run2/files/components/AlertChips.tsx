import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ReportIcon from "@mui/icons-material/ReportProblem";

/** Medical alerts, always solid red with a warning icon so they cannot be missed. */
export default function AlertChips({ alerts, size = "small" }: { alerts: string[]; size?: "small" | "medium" }) {
  if (alerts.length === 0) return null;
  return (
    <Box component="ul" aria-label="Medical alerts" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, m: 0, p: 0, listStyle: "none" }}>
      {alerts.map((a) => (
        <li key={a}>
          <Chip
            color="error"
            size={size}
            icon={<ReportIcon />}
            label={
              <>
                <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  Medical alert:{" "}
                </Box>
                {a}
              </>
            }
            sx={{ height: "auto", minHeight: size === "small" ? 26 : 32, "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 }, fontWeight: 700 }}
          />
        </li>
      ))}
    </Box>
  );
}
