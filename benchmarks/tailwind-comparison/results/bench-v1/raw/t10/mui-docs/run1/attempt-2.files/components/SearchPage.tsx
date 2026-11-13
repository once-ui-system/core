"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeCard from "./HomeCard";
import MapClient from "./MapClient";
import {
  HOMES,
  Home,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  SITE,
  SortKey,
  TYPE_OPTIONS,
  formatPrice,
} from "@/lib/data";

type TypeFilter = (typeof TYPE_OPTIONS)[number];

const BED_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

function sortHomes(homes: Home[], sort: SortKey): Home[] {
  const list = [...homes];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "size":
      return list.sort((a, b) => b.area_m2 - a.area_m2);
    default:
      return list.sort((a, b) => Date.parse(b.listed) - Date.parse(a.listed));
  }
}

export default function SearchPage() {
  const [type, setType] = useState<TypeFilter>("Any");
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [minBeds, setMinBeds] = useState(0);
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"list" | "map">("list");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const results = useMemo(() => {
    const filtered = HOMES.filter((h) => {
      if (type !== "Any" && h.type !== type) return false;
      if (h.price < price[0]) return false;
      // The top of the slider means "no upper limit".
      if (price[1] < PRICE_MAX && h.price > price[1]) return false;
      if (h.beds < minBeds) return false;
      return true;
    });
    return sortHomes(filtered, sort);
  }, [type, price, minBeds, sort]);

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const el = document.getElementById(`card-${id}`);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const resetFilters = () => {
    setType("Any");
    setPrice([PRICE_MIN, PRICE_MAX]);
    setMinBeds(0);
  };

  const priceLabel = `${formatPrice(price[0])} – ${
    price[1] >= PRICE_MAX ? `${formatPrice(PRICE_MAX)}+` : formatPrice(price[1])
  }`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Paper
        component="header"
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth={false} sx={{ py: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <HomeWorkIcon color="primary" aria-hidden />
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              {SITE.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", display: { xs: "none", sm: "block" }, ml: 1 }}
            >
              Homes for sale in {SITE.city}
            </Typography>
          </Stack>
        </Container>
      </Paper>

      <Paper
        component="section"
        aria-label="Search filters"
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", position: "relative", zIndex: 2 }}
      >
        <Container maxWidth={false} sx={{ py: 2 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "center",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "minmax(150px,1fr) minmax(260px,1.6fr) minmax(220px,1fr) minmax(180px,1fr)",
              },
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type-select"
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value as TypeFilter)}
              >
                {TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t === "Any" ? "Any type" : t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ px: 1 }}>
              <Typography id="price-label" variant="caption" sx={{ color: "text.secondary" }}>
                Price: {priceLabel}
              </Typography>
              <Slider
                size="small"
                value={price}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                onChange={(_, v) => setPrice(v as [number, number])}
                valueLabelDisplay="off"
                disableSwap
                getAriaLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")}
                getAriaValueText={(v) => formatPrice(v)}
                aria-labelledby="price-label"
              />
            </Box>

            <Box>
              <Typography
                id="beds-label"
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
              >
                Minimum bedrooms
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={minBeds}
                onChange={(_, v: number | null) => {
                  if (v !== null) setMinBeds(v);
                }}
                aria-labelledby="beds-label"
                fullWidth
              >
                {BED_OPTIONS.map((o) => (
                  <ToggleButton
                    key={o.value}
                    value={o.value}
                    aria-label={o.value === 0 ? "Any number of bedrooms" : `${o.value} or more bedrooms`}
                    sx={{ px: 1 }}
                  >
                    {o.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select
                labelId="sort-label"
                id="sort-select"
                label="Sort by"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Container>
      </Paper>

      <Container
        maxWidth={false}
        sx={{ py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
      >
        <Typography variant="subtitle1" component="h2" role="status" aria-live="polite" sx={{ fontWeight: 700 }}>
          {results.length} {results.length === 1 ? "home" : "homes"} in {SITE.city}
        </Typography>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v: "list" | "map" | null) => {
            if (v) setView(v);
          }}
          aria-label="Results view"
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <ToggleButton value="list" aria-label="Show list">
            <ViewListOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> List
          </ToggleButton>
          <ToggleButton value="map" aria-label="Show map">
            <MapOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Map
          </ToggleButton>
        </ToggleButtonGroup>
      </Container>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 5fr) 7fr", lg: "minmax(420px, 5fr) 7fr" },
          gap: 2,
          px: { xs: 2, sm: 3 },
          pb: 2,
          minHeight: 0,
        }}
      >
        <Box
          component="section"
          aria-label="Search results"
          sx={{
            display: { xs: view === "list" ? "block" : "none", md: "block" },
            minWidth: 0,
            maxHeight: { md: "calc(100dvh - 220px)" },
            minHeight: { md: 480 },
            overflowY: { md: "auto" },
            pr: { md: 0.5 },
          }}
        >
          {results.length === 0 ? (
            <Stack
              sx={{ alignItems: "center", textAlign: "center", py: 8, gap: 1.5, color: "text.secondary" }}
            >
              <SearchOffIcon sx={{ fontSize: 48 }} />
              <Typography variant="h6" component="p" sx={{ color: "text.primary" }}>
                No homes match these filters
              </Typography>
              <Typography variant="body2">Try widening the price range or bedrooms.</Typography>
              <Button variant="outlined" onClick={resetFilters}>
                Reset filters
              </Button>
            </Stack>
          ) : (
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))", md: "1fr" },
              }}
            >
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard
                    home={home}
                    highlighted={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onToggleSave={toggleSave}
                    onHover={handleHover}
                  />
                </li>
              ))}
            </Box>
          )}
        </Box>

        <Box
          component="section"
          aria-label={`Map of ${results.length} homes in ${SITE.city}`}
          sx={{
            display: { xs: view === "map" ? "block" : "none", md: "block" },
            height: { xs: "calc(100dvh - 280px)", md: "calc(100dvh - 220px)" },
            minHeight: { xs: 360, md: 480 },
            position: { md: "sticky" },
            top: { md: 16 },
            borderRadius: 2,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          <MapClient
            homes={results}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        </Box>
      </Box>
    </Box>
  );
}
