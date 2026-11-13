import Chip from "@mui/material/Chip";

export default function DietChip({ diet }: { diet: string | null }) {
  if (!diet) return null;
  const critical = diet === "Nut allergy";
  return (
    <Chip
      size="small"
      label={diet}
      color={critical ? "error" : "warning"}
      variant="outlined"
      sx={{ height: 22, fontSize: 12 }}
    />
  );
}
