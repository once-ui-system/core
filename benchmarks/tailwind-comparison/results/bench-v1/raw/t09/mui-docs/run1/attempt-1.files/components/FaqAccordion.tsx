"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useId, useState } from "react";
import { faq } from "../lib/data";

export default function FaqAccordion() {
  const baseId = useId();
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box
      component="section"
      id="faq"
      aria-labelledby="faq-heading"
      sx={{ py: { xs: 6, md: 9 }, borderTop: 1, borderColor: "divider", scrollMarginTop: 72 }}
    >
      <Container maxWidth="md">
        <Typography id="faq-heading" variant="h2" component="h2" sx={{ mb: 4 }}>
          Frequently asked questions
        </Typography>
        {faq.map((item, index) => (
          <Accordion
            key={item.q}
            expanded={expanded === index}
            onChange={(_event, isExpanded) => setExpanded(isExpanded ? index : false)}
            slotProps={{ heading: { component: "h3" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${baseId}-${index}-content`}
              id={`${baseId}-${index}-header`}
            >
              {item.q}
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
