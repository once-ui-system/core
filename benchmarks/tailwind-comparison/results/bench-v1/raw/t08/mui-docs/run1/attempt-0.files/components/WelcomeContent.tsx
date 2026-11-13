"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { NEXT_STEPS, TEAM_SIZES, USER } from "@/lib/data";
import { useOnboarding } from "@/lib/onboarding";

export default function WelcomeContent() {
  const { state, hydrated, reset } = useOnboarding();
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  const firstName = (state.name.trim() || USER.name).split(/\s+/)[0];
  const workspace = state.workspaceName.trim();
  const teamSize = TEAM_SIZES.find((t) => t.value === state.teamSize);
  const invited = state.invites.filter((i) => i.trim()).length;

  const completed = NEXT_STEPS.filter((s) => done[s.id]).length;
  const progress = (completed / NEXT_STEPS.length) * 100;

  const toggle = (id: string) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", bgcolor: "background.default", py: { xs: 4, md: 8 } }}
    >
      <Container maxWidth="sm">
        <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center", mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 56 }} aria-hidden />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {hydrated ? `You're all set, ${firstName}!` : "You're all set!"}
          </Typography>
          <Typography color="text.secondary">
            {hydrated && workspace ? (
              <>
                <strong>{workspace}</strong> is ready
                {teamSize ? ` for a team of ${teamSize.label.toLowerCase()}` : ""}
                {invited > 0
                  ? `, and ${invited} invitation${invited === 1 ? " is" : "s are"} on the way`
                  : ""}
                .
              </>
            ) : (
              "Your Lumen workspace is ready."
            )}{" "}
            Here&apos;s how to get the most out of your first week.
          </Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "baseline", px: 1 }}
            >
              <Typography variant="h6" component="h2" id="checklist-heading">
                Next steps
              </Typography>
              <Typography variant="body2" color="text.secondary" aria-live="polite">
                {completed} of {NEXT_STEPS.length} done
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              aria-label="Checklist progress"
              sx={{ mx: 1, my: 1.5, borderRadius: 1 }}
            />
            <List aria-labelledby="checklist-heading" disablePadding>
              {NEXT_STEPS.map((step) => {
                const labelId = `step-${step.id}`;
                return (
                  <ListItem key={step.id} disablePadding>
                    <ListItemButton
                      role={undefined}
                      onClick={() => toggle(step.id)}
                      sx={{ borderRadius: 1, alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}>
                        <Checkbox
                          edge="start"
                          checked={Boolean(done[step.id])}
                          tabIndex={-1}
                          disableRipple
                          slotProps={{ input: { "aria-labelledby": labelId } }}
                          sx={{ p: 0.5 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        id={labelId}
                        primary={step.title}
                        secondary={step.detail}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: 600,
                              textDecoration: done[step.id] ? "line-through" : "none",
                              color: done[step.id] ? "text.secondary" : "text.primary",
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3, justifyContent: "center" }}
        >
          <Button
            component={Link}
            href="/"
            variant="text"
            color="inherit"
            onClick={reset}
          >
            Start over
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
