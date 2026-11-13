"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import SquareFootOutlinedIcon from "@mui/icons-material/SquareFootOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Link from "./Link";
import Placeholder from "./Placeholder";
import { Home, bedsLabel, formatPrice, isNew } from "@/lib/data";

interface HomeCardProps {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export default function HomeCard({
  home,
  highlighted,
  saved,
  onToggleSave,
  onHover,
}: HomeCardProps) {
  const fresh = isNew(home);

  return (
    <Card
      component="article"
      id={`card-${home.id}`}
      variant="outlined"
      aria-labelledby={`title-${home.id}`}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: { xs: "column", sm: "row", lg: "column", xl: "row" },
        overflow: "hidden",
        transition: "box-shadow 150ms, border-color 150ms, transform 150ms",
        borderColor: highlighted ? "primary.main" : "divider",
        boxShadow: highlighted ? 6 : 0,
        outline: highlighted ? "2px solid" : "none",
        outlineColor: "primary.main",
        outlineOffset: -1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 220, lg: "100%", xl: 220 },
          flexShrink: 0,
        }}
      >
        <Placeholder id={home.id} height={{ xs: 150, sm: "100%", lg: 150, xl: "100%" }} />
        {fresh && (
          <Chip
            label="New"
            size="small"
            color="secondary"
            sx={{ position: "absolute", top: 10, left: 10, fontWeight: 700 }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="h6" component="p" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {formatPrice(home.price)}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onToggleSave(home.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
            color={saved ? "error" : "default"}
            sx={{ position: "relative", zIndex: 2, mt: -0.5, mr: -0.5 }}
          >
            {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>

        <Typography
          variant="subtitle1"
          component="h3"
          id={`title-${home.id}`}
          sx={{ fontWeight: 600, lineHeight: 1.3, mt: 0.5 }}
        >
          <Box
            component={Link}
            href={`/homes/${home.id}`}
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              "&::after": { content: '""', position: "absolute", inset: 0, zIndex: 1 },
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
            }}
          >
            {home.title}
          </Box>
        </Typography>

        <Stack
          direction="row"
          useFlexGap
          sx={{ gap: 0.5, alignItems: "center", color: "text.secondary", mt: 0.5 }}
        >
          <PlaceOutlinedIcon fontSize="small" />
          <Typography variant="body2">
            {home.district}, {home.type}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          useFlexGap
          sx={{ mt: 1.5, columnGap: 2, rowGap: 0.5, flexWrap: "wrap", color: "text.secondary" }}
        >
          <Fact icon={<BedOutlinedIcon fontSize="small" />} text={bedsLabel(home.beds)} />
          <Fact
            icon={<BathtubOutlinedIcon fontSize="small" />}
            text={`${home.baths} bath${home.baths === 1 ? "" : "s"}`}
          />
          <Fact icon={<SquareFootOutlinedIcon fontSize="small" />} text={`${home.area_m2} m²`} />
        </Stack>
      </Box>
    </Card>
  );
}

function Fact({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
      {icon}
      <Typography variant="body2">{text}</Typography>
    </Stack>
  );
}
