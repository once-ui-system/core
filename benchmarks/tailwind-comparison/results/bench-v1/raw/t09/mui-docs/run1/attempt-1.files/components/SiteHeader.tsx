"use client";

import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, navLinks } from "../lib/data";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <AppBar position="sticky" component="header">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 60, sm: 68 } }}>
          <Link
            href="/"
            underline="none"
            aria-label={`${brand.name} home`}
            sx={{
              fontFamily: "h1.fontFamily",
              typography: "h5",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mr: { sm: 4 },
              color: "text.primary",
            }}
          >
            <Box
              aria-hidden
              component="span"
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "inline-block",
              }}
            />
            {brand.name}
          </Link>

          <Box
            component="nav"
            aria-label="Main"
            sx={{ display: { xs: "none", sm: "flex" }, gap: 0.5, flexGrow: 1 }}
          >
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  href={item.href}
                  color="inherit"
                  aria-current={active ? "page" : undefined}
                  sx={{
                    color: active ? "text.primary" : "text.secondary",
                    boxShadow: active
                      ? "inset 0 -2px 0 var(--mui-palette-primary-main)"
                      : "none",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />

          <Button
            href="/pricing"
            variant="contained"
            size="small"
            sx={{ display: { xs: "none", sm: "inline-flex" }, mr: 1 }}
          >
            Get started
          </Button>

          <ThemeToggle />

          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            aria-controls={menuOpen ? "mobile-nav-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="mobile-nav-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {navLinks.map((item) => (
              <MenuItem
                key={item.href}
                component="a"
                href={item.href}
                selected={pathname === item.href}
                onClick={() => setAnchorEl(null)}
              >
                {item.label}
              </MenuItem>
            ))}
            <MenuItem
              component="a"
              href="/pricing"
              onClick={() => setAnchorEl(null)}
            >
              Get started
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
