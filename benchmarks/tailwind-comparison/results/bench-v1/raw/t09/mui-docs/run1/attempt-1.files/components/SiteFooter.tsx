import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { brand, navLinks } from "../lib/data";

const productLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Plans compared", href: "/pricing#compare" },
  { label: "FAQ", href: "/pricing#faq" },
];

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        mt: "auto",
        py: { xs: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 4, md: 8 }}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ maxWidth: 360 }}>
            <Typography variant="h5" component="p" sx={{ mb: 1 }}>
              {brand.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {brand.tagline}.
            </Typography>
          </Box>

          <Stack direction="row" spacing={{ xs: 6, md: 10 }}>
            <Box component="nav" aria-label="Footer">
              <Typography variant="overline" color="text.secondary">
                Site
              </Typography>
              <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}>
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="body2">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Box>
            <Box component="nav" aria-label="Product">
              <Typography variant="overline" color="text.secondary">
                Product
              </Typography>
              <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 1 }}>
                {productLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="body2">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 5 }}
        >
          © {new Date().getFullYear()} {brand.name}. Your data is stored in the EU,
          encrypted at rest.
        </Typography>
      </Container>
    </Box>
  );
}
