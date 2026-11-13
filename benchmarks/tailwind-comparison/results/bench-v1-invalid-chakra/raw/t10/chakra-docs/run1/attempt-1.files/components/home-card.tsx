"use client";

import NextLink from "next/link";
import { Badge, Box, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import { LuBath, LuBed, LuMapPin, LuRuler } from "react-icons/lu";
import {
  type Home,
  bedsLabel,
  formatPrice,
  isNewListing,
} from "@/lib/data";
import { HomeVisual } from "./home-visual";
import { SaveButton } from "./save-button";

interface Props {
  home: Home;
  highlighted: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function HomeCard({
  home,
  highlighted,
  saved,
  onToggleSave,
  onHover,
}: Props) {
  return (
    <Box
      as="article"
      id={`card-${home.id}`}
      position="relative"
      bg="bg.panel"
      borderWidth="2px"
      borderColor={highlighted ? "teal.500" : "border"}
      rounded="lg"
      overflow="hidden"
      shadow={highlighted ? "md" : "xs"}
      transition="box-shadow 0.15s, border-color 0.15s"
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
    >
      <Box position="relative" height="160px">
        <HomeVisual
          id={home.id}
          label={`Photo placeholder for ${home.title}`}
        />
        {isNewListing(home) && (
          <Badge
            position="absolute"
            top="3"
            left="3"
            colorPalette="green"
            variant="solid"
          >
            New
          </Badge>
        )}
        <Box position="absolute" top="2" right="2" zIndex="2">
          <SaveButton
            saved={saved}
            title={home.title}
            onToggle={() => onToggleSave(home.id)}
          />
        </Box>
      </Box>
      <Box p="4">
        <Text fontSize="xl" fontWeight="bold">
          {formatPrice(home.price)}
        </Text>
        <Heading as="h3" size="md" mt="1">
          <NextLink
            href={`/homes/${home.id}`}
            style={{ textDecoration: "none" }}
          >
            {home.title}
            <Box
              as="span"
              position="absolute"
              inset="0"
              zIndex="1"
              aria-hidden="true"
            />
          </NextLink>
        </Heading>
        <Flex mt="2" gap="4" wrap="wrap" color="fg.muted" fontSize="sm">
          <HStack gap="1">
            <LuBed aria-hidden="true" />
            <Text as="span">{bedsLabel(home.beds)}</Text>
          </HStack>
          <HStack gap="1">
            <LuBath aria-hidden="true" />
            <Text as="span">
              {home.baths} bath{home.baths === 1 ? "" : "s"}
            </Text>
          </HStack>
          <HStack gap="1">
            <LuRuler aria-hidden="true" />
            <Text as="span">{home.area_m2} m²</Text>
          </HStack>
        </Flex>
        <HStack mt="2" gap="1" color="fg.muted" fontSize="sm">
          <LuMapPin aria-hidden="true" />
          <Text as="span">
            {home.district} · {home.type}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
