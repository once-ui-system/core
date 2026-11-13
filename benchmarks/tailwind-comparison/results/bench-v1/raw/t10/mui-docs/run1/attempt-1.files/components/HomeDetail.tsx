import Link from "next/link";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import SquareFootOutlinedIcon from "@mui/icons-material/SquareFootOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Placeholder from "./Placeholder";
import ContactForm from "./ContactForm";
import DetailMapClient from "./DetailMapClient";
import {
  AGENT,
  Home,
  SITE,
  bedsLabel,
  formatListed,
  formatPrice,
  isNew,
} from "@/lib/data";

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#0a7d3c",
  A: "#2e9e44",
  B: "#7bb52f",
  C: "#c9c21a",
  D: "#f0b429",
  E: "#ee7d22",
  F: "#d93a2b",
};

function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <Stack
        direction="row"
        role="img"
        aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}
        sx={{ gap: 0.5, flexWrap: "wrap" }}
      >
        {ENERGY_SCALE.map((s) => {
          const active = s === rating;
          return (
            <Box
              key={s}
              aria-hidden
              sx={{
                minWidth: active ? 54 : 40,
                height: active ? 54 : 40,
                alignSelf: "center",
                display: "grid",
                placeItems: "center",
                borderRadius: 1,
                fontWeight: 800,
                fontSize: active ? 22 : 14,
                color: "#fff",
                textShadow: "0 1px 1px rgba(0,0,0,0.35)",
                bgcolor: ENERGY_COLORS[s],
                opacity: active ? 1 : 0.4,
                outline: active ? "3px solid" : "none",
                outlineColor: "text.primary",
                outlineOffset: 2,
              }}
            >
              {s}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function KeyFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Stack sx={{ gap: 0.25 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, color: "text.secondary" }}>
        {icon}
        <Typography variant="caption" component="dt">
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" component="dd" sx={{ fontWeight: 700, m: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function HomeDetail({ home }: { home: Home }) {
  const fresh = isNew(home);
  const pricePerM2 = Math.round(home.price / home.area_m2);

  return (
    <Box component="main" sx={{ pb: 6 }}>
      <Paper component="header" square elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Breadcrumbs aria-label="Breadcrumb">
            <Box
              component={Link}
              href="/"
              sx={{ color: "primary.main", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              {SITE.name}
            </Box>
            <Typography color="text.primary">{home.title}</Typography>
          </Breadcrumbs>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Gallery strip */}
        <Box
          component="ul"
          aria-label="Photo gallery"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            pb: 1,
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
          }}
          tabIndex={0}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              component="li"
              key={i}
              sx={{
                flex: "0 0 auto",
                width: { xs: "82%", sm: 360, md: 380 },
                scrollSnapAlign: "start",
              }}
            >
              <Placeholder
                id={home.id}
                variant={i}
                height={{ xs: 200, md: 240 }}
                rounded
                label={`${home.title}, photo ${i + 1} of 5`}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gap: 4,
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 7fr) minmax(300px, 4fr)" },
            alignItems: "start",
          }}
        >
          {/* Facts column */}
          <Stack sx={{ gap: 4, minWidth: 0 }}>
            <Box component="section" aria-labelledby="home-title">
              <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: "center", flexWrap: "wrap", mb: 1 }}>
                <Chip label={home.type} size="small" variant="outlined" />
                {fresh && <Chip label="New" size="small" color="secondary" sx={{ fontWeight: 700 }} />}
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {formatListed(home.listed)}
                </Typography>
              </Stack>
              <Typography variant="h3" component="h1" id="home-title" sx={{ fontWeight: 800, fontSize: { xs: 28, sm: 36 }, lineHeight: 1.15 }}>
                {home.title}
              </Typography>
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, color: "text.secondary", mt: 0.5 }}>
                <PlaceOutlinedIcon fontSize="small" />
                <Typography variant="body1">
                  {home.district}, {SITE.city}
                </Typography>
              </Stack>
              <Typography variant="h4" component="p" sx={{ fontWeight: 800, mt: 2, color: "primary.main" }}>
                {formatPrice(home.price)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {formatPrice(pricePerM2)} per m²
              </Typography>
            </Box>

            <Box component="section" aria-labelledby="facts-heading">
              <Typography variant="h6" component="h2" id="facts-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Key facts
              </Typography>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: "grid",
                  gap: 2.5,
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
                }}
              >
                <KeyFact icon={<BedOutlinedIcon fontSize="small" />} label="Bedrooms" value={bedsLabel(home.beds)} />
                <KeyFact
                  icon={<BathtubOutlinedIcon fontSize="small" />}
                  label="Bathrooms"
                  value={String(home.baths)}
                />
                <KeyFact
                  icon={<SquareFootOutlinedIcon fontSize="small" />}
                  label="Area"
                  value={`${home.area_m2} m²`}
                />
                <KeyFact
                  icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                  label="Built"
                  value={String(home.year)}
                />
              </Box>
            </Box>

            <Divider />

            <Box component="section" aria-labelledby="features-heading">
              <Typography variant="h6" component="h2" id="features-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Features
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: "none",
                  m: 0,
                  p: 0,
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                }}
              >
                {home.features.map((f) => (
                  <Stack component="li" key={f} direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <CheckCircleOutlinedIcon color="success" fontSize="small" />
                    <Typography variant="body1">{f}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>

            <Box component="section" aria-labelledby="energy-heading">
              <Typography variant="h6" component="h2" id="energy-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Energy rating
              </Typography>
              <EnergyRating rating={home.energy} />
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                This home is rated {home.energy} on the A+ to F certificate scale.
              </Typography>
            </Box>

            <Box component="section" aria-labelledby="location-heading">
              <Typography variant="h6" component="h2" id="location-heading" sx={{ fontWeight: 700, mb: 1.5 }}>
                Location
              </Typography>
              <Box
                sx={{
                  height: { xs: 260, sm: 320 },
                  borderRadius: 2,
                  overflow: "hidden",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <DetailMapClient home={home} />
              </Box>
            </Box>
          </Stack>

          {/* Contact column */}
          <Paper
            component="aside"
            variant="outlined"
            aria-labelledby="contact-heading"
            sx={{ p: { xs: 2, sm: 3 }, position: { md: "sticky" }, top: { md: 16 } }}
          >
            <Typography variant="h6" component="h2" id="contact-heading" sx={{ fontWeight: 700 }}>
              Contact the agent
            </Typography>
            <Stack sx={{ mt: 1, mb: 2.5, gap: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {AGENT.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {AGENT.agency}
              </Typography>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <PhoneOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2">{AGENT.phone}</Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                <EmailOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2">{AGENT.email}</Typography>
              </Stack>
            </Stack>
            <ContactForm homeTitle={home.title} agentName={AGENT.name} />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
