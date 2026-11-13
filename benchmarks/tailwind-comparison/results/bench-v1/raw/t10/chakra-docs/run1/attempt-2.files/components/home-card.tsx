"use client";

import NextLink from "next/link";
import { Badge, Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuBath, LuBedDouble, LuHeart, LuMaximize } from "react-icons/lu";
import { PlaceholderPhoto } from "@/components/placeholder-photo";
import { bedsLabel, formatPrice, isNew, type Home } from "@/lib/data";

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
      borderWidth="1px"
      borderColor={highlighted ? "teal.500" : "border"}
      boxShadow={highlighted ? "0 0 0 2px #14b8a6" : "sm"}
      borderRadius="lg"
      overflow="hidden"
      bg="bg"
      transition="box-shadow 120ms ease, border-color 120ms ease"
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Box position="relative" height="170px">
        <PlaceholderPhoto
          id={home.id}
          label={`Photo placeholder for ${home.title}`}
        />
        {isNew(home.listed) && (
          <Badge
            position="absolute"
            top="3"
            left="3"
            colorPalette="green"
            variant="solid"
          >
            New this week
          </Badge>
        )}
      </Box>

      <Box p="4">
        <Text fontSize="xl" fontWeight="bold" lineHeight="short">
          {formatPrice(home.price)}
        </Text>
        <Text fontWeight="semibold" mt="1" lineClamp={1}>
          <NextLink
            href={`/homes/${home.id}`}
            onFocus={() => onHover(home.id)}
            onBlur={() => onHover(null)}
          >
            {home.title}
            {/* stretches the link over the whole card; the save button sits above it */}
            <Box as="span" position="absolute" inset="0" aria-hidden="true" />
          </NextLink>
        </Text>
        <Text color="fg.muted" fontSize="sm">
          {home.type} · {home.district}
        </Text>
        <Flex mt="3" gap="4" wrap="wrap" fontSize="sm" color="fg.muted">
          <HStack gap="1.5">
            <LuBedDouble aria-hidden="true" />
            <Text as="span">{bedsLabel(home.beds)}</Text>
          </HStack>
          <HStack gap="1.5">
            <LuBath aria-hidden="true" />
            <Text as="span">
              {home.baths} bath{home.baths === 1 ? "" : "s"}
            </Text>
          </HStack>
          <HStack gap="1.5">
            <LuMaximize aria-hidden="true" />
            <Text as="span">{home.area_m2} m²</Text>
          </HStack>
        </Flex>
      </Box>

      <IconButton
        position="absolute"
        top="2"
        right="2"
        zIndex={1}
        size="sm"
        rounded="full"
        variant="solid"
        bg="bg"
        color={saved ? "red.500" : "fg"}
        aria-label={
          saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`
        }
        aria-pressed={saved}
        onClick={() => onToggleSave(home.id)}
      >
        <LuHeart fill={saved ? "currentColor" : "none"} />
      </IconButton>
    </Box>
  );
}
