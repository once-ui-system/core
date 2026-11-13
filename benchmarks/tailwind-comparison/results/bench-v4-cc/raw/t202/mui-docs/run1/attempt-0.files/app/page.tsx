import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ArmedBar from "@/components/ArmedBar";
import RulesPanel from "@/components/RulesPanel";
import RoomPlan, { TableStrip } from "@/components/RoomPlan";
import StatsBar from "@/components/StatsBar";
import TablePanel from "@/components/TablePanel";
import UnseatedPanel from "@/components/UnseatedPanel";

export default function Page() {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 1680, mx: "auto" }}>
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        Seating plan
      </h1>
      <StatsBar />
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
        }}
      >
        <Stack spacing={1.5} sx={{ minWidth: 0 }}>
          <ArmedBar />
          <RoomPlan />
          <TableStrip />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            alignItems: "start",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", lg: "minmax(0, 1fr)" },
            position: { lg: "sticky" },
            top: { lg: 128 },
            maxHeight: { lg: "calc(100dvh - 144px)" },
            overflowY: { lg: "auto" },
            pr: { lg: 0.5 },
          }}
        >
          <UnseatedPanel />
          <Stack spacing={2}>
            <TablePanel />
            <RulesPanel />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
