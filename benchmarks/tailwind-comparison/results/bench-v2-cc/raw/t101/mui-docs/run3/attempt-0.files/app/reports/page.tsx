"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeading from "@/components/PageHeading";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  return (
    <Box>
      <PageHeading title="Reports" subtitle="Open issues by project" />
      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <List disablePadding aria-label="Open issues by project">
            {projects.map((p) => (
              <ListItem key={p.key} disableGutters divider>
                <ListItemText primary={`${p.key} · ${p.name}`} />
                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.issues}
                </Typography>
              </ListItem>
            ))}
            <ListItem disableGutters>
              <ListItemText primary="Total" slotProps={{ primary: { sx: { fontWeight: 700 } } }} />
              <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {total}
              </Typography>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
