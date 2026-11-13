"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TEAM_SIZES, THEME_OPTIONS } from "@/lib/data";
import type { OnboardingState } from "@/lib/validation";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="dt">
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="dd"
        sx={{ m: 0, overflowWrap: "anywhere" }}
      >
        {children}
      </Typography>
    </Box>
  );
}

const NOT_SET = (
  <Typography
    component="span"
    variant="body2"
    color="text.secondary"
    sx={{ fontStyle: "italic" }}
  >
    Not set yet
  </Typography>
);

export default function SummaryCard({ state }: { state: OnboardingState }) {
  const teamSize = TEAM_SIZES.find((t) => t.value === state.teamSize);
  const themeLabel = THEME_OPTIONS.find((t) => t.value === state.theme)?.label;
  const invites = state.invites.map((i) => i.trim()).filter(Boolean);

  return (
    <Card
      variant="outlined"
      component="aside"
      aria-labelledby="summary-heading"
      sx={{ position: { md: "sticky" }, top: { md: 24 } }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography
          id="summary-heading"
          variant="overline"
          color="text.secondary"
          component="h2"
        >
          Your setup so far
        </Typography>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center", my: 2 }}>
          <Avatar
            aria-hidden
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            {initials(state.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
            >
              {state.name.trim() || "Your name"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: "anywhere" }}
            >
              {state.email.trim() || "you@company.com"}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack component="dl" spacing={1.75} sx={{ m: 0 }}>
          <Row label="Workspace">{state.workspaceName.trim() || NOT_SET}</Row>
          <Row label="Team size">{teamSize ? teamSize.label : NOT_SET}</Row>
          <Row label="Invites">
            {invites.length > 0 ? (
              <Stack
                direction="row"
                useFlexGap
                sx={{ flexWrap: "wrap", gap: 0.75, mt: 0.5 }}
              >
                {invites.map((email) => (
                  <Chip key={email} size="small" label={email} />
                ))}
              </Stack>
            ) : (
              NOT_SET
            )}
          </Row>
          <Row label="Theme">{themeLabel}</Row>
          <Row label="Weekly digest">
            {state.weeklyDigest ? "On, every Monday" : "Off"}
          </Row>
        </Stack>
      </CardContent>
    </Card>
  );
}
