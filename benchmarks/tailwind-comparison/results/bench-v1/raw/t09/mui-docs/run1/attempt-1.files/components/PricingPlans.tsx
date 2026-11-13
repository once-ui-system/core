"use client";

import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  YEARLY_MONTHS_PAID,
  plans,
  yearlyPerMonth,
  yearlyPrice,
} from "../lib/data";

const visuallyHiddenSx = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} as const;

function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

export default function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <Box component="section" aria-labelledby="pricing-heading" sx={{ py: { xs: 7, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto" }}>
          <Typography variant="overline" color="primary.light" component="p">
            Pricing
          </Typography>
          <Typography id="pricing-heading" variant="h1" component="h1" sx={{ mt: 1 }}>
            Simple per-seat pricing
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: "1.0625rem" }}>
            Start free, add your team when you are ready. Pay yearly and get two
            months free.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 4, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography
              component="span"
              aria-hidden
              color={yearly ? "text.secondary" : "text.primary"}
              sx={{ fontWeight: yearly ? 400 : 700 }}
            >
              Monthly
            </Typography>
            <FormControlLabel
              sx={{ m: 0 }}
              label={<Box component="span" sx={visuallyHiddenSx}>Bill yearly</Box>}
              control={
                <Switch
                  checked={yearly}
                  onChange={(event) => setYearly(event.target.checked)}
                />
              }
            />
            <Typography
              component="span"
              aria-hidden
              color={yearly ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: yearly ? 700 : 400 }}
            >
              Yearly
            </Typography>
            <Chip
              size="small"
              color="primary"
              label="2 months free"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
          <Typography role="status" variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {yearly
              ? `Showing yearly prices: ${YEARLY_MONTHS_PAID} months billed, 2 free.`
              : "Showing monthly prices."}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 6,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            alignItems: "stretch",
          }}
        >
          {plans.map((plan) => {
            const free = plan.priceMonth === 0;
            const headingId = `plan-${plan.name.toLowerCase()}`;
            return (
              <Card
                key={plan.name}
                component="article"
                aria-labelledby={headingId}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  ...(plan.highlight && {
                    borderColor: "primary.main",
                    borderWidth: 2,
                    bgcolor: "background.paper",
                    boxShadow: "0 0 0 4px rgba(232, 89, 12, 0.14)",
                  }),
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "center", minHeight: 32 }}
                  >
                    <Typography id={headingId} variant="h4" component="h2">
                      {plan.name}
                    </Typography>
                    {plan.highlight && (
                      <Chip size="small" color="primary" label="Most popular" sx={{ fontWeight: 700 }} />
                    )}
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {plan.blurb}
                  </Typography>

                  <Box sx={{ mt: 3, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: "h1.fontFamily",
                        fontWeight: 700,
                        fontSize: "3rem",
                        lineHeight: 1,
                      }}
                    >
                      {free
                        ? "$0"
                        : yearly
                          ? formatPrice(yearlyPrice(plan.priceMonth))
                          : formatPrice(plan.priceMonth)}
                    </Typography>
                    <Typography color="text.secondary">
                      {free
                        ? "forever"
                        : yearly
                          ? "per seat / year"
                          : "per seat / month"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 20 }}>
                    {free
                      ? plan.seats
                      : yearly
                        ? `${formatPrice(yearlyPerMonth(plan.priceMonth))} per seat / month, billed yearly`
                        : "Billed monthly, cancel any time"}
                  </Typography>

                  <Stack
                    component="ul"
                    spacing={1.25}
                    sx={{ listStyle: "none", p: 0, m: 0, mt: 3 }}
                  >
                    {plan.features.map((feature) => (
                      <Stack
                        key={feature}
                        component="li"
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckIcon aria-hidden fontSize="small" sx={{ color: "primary.light", mt: "2px" }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    size="large"
                    href="#"
                    variant={plan.highlight ? "contained" : "outlined"}
                    color={plan.highlight ? "primary" : "inherit"}
                    onClick={(event) => event.preventDefault()}
                    aria-label={`${plan.cta}, ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
