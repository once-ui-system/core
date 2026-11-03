"use client";

import { Badge, Box, Flex, HStack, IconButton, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuBath, LuBedDouble, LuHeart, LuMaximize } from "react-icons/lu";
import { Placeholder } from "./placeholder";
import { bedsLabel, formatPrice, isNew, type Home } from "../lib/data";

interface HomeCardProps {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onHover: (id: string | null) => void;
  onToggleSave: (id: string) => void;
}

export function HomeCard({ home, highlighted, saved, onHover, onToggleSave }: HomeCardProps) {
  const fresh = isNew(home.listed);
  return (
    <Box
      as="article"
      id={`card-${home.id}`}
      aria-labelledby={`title-${home.id}`}
      position="relative"
      borderWidth="2px"
      borderColor={highlighted ? "teal.500" : "border"}
      rounded="lg"
      overflow="hidden"
      bg="bg"
      shadow={highlighted ? "md" : "xs"}
      transition="box-shadow 0.15s, border-color 0.15s"
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
    >
      <Box position="relative">
        <Placeholder id={home.id} height="150px" rounded="0" label={`Photo placeholder for ${home.title}`} />
        {fresh && (
          <Badge position="absolute" top={2} left={2} colorPalette="orange" variant="solid">
            New
          </Badge>
        )}
        <IconButton
          aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
          aria-pressed={saved}
          position="absolute"
          top={2}
          right={2}
          size="sm"
          rounded="full"
          variant="solid"
          colorPalette={saved ? "red" : "gray"}
          onClick={() => onToggleSave(home.id)}
        >
          <LuHeart fill={saved ? "currentColor" : "none"} />
        </IconButton>
      </Box>
      <Box p={3}>
        <Flex justify="space-between" align="baseline" gap={2}>
          <Text fontWeight="bold" fontSize="xl">
            {formatPrice(home.price)}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {home.type}
          </Text>
        </Flex>
        <ChakraLink
          asChild
          id={`title-${home.id}`}
          fontWeight="medium"
          display="block"
          mt={0.5}
        >
          <NextLink href={`/homes/${home.id}`}>{home.title}</NextLink>
        </ChakraLink>
        <HStack gap={4} mt={2} color="fg.muted" fontSize="sm" wrap="wrap">
          <Flex align="center" gap={1}>
            <LuBedDouble aria-hidden="true" /> {bedsLabel(home.beds)}
          </Flex>
          <Flex align="center" gap={1}>
            <LuBath aria-hidden="true" /> {home.baths} bath{home.baths === 1 ? "" : "s"}
          </Flex>
          <Flex align="center" gap={1}>
            <LuMaximize aria-hidden="true" /> {home.area_m2} m²
          </Flex>
        </HStack>
        <Text mt={2} fontSize="sm" color="fg.muted">
          {home.district}, Lisbon
        </Text>
      </Box>
    </Box>
  );
}
