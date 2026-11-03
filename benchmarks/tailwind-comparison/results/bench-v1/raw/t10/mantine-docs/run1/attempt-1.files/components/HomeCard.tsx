"use client";

import Link from "next/link";
import { ActionIcon, Badge, Card, Text } from "@mantine/core";
import { IconBath, IconBed, IconHeart, IconHeartFilled, IconRuler2 } from "@tabler/icons-react";
import { bedsLabel, formatPrice, isNew, type Home } from "@/lib/data";
import { Placeholder } from "./Placeholder";
import classes from "./HomeCard.module.css";

interface HomeCardProps {
  home: Home;
  active: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function HomeCard({ home, active, saved, onToggleSave, onHover }: HomeCardProps) {
  return (
    <Card
      component="li"
      padding={0}
      radius="md"
      className={classes.card}
      data-active={active || undefined}
      data-home-id={home.id}
      onMouseEnter={() => onHover(home.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(home.id)}
      onBlur={() => onHover(null)}
    >
      <div className={classes.photo}>
        <Placeholder seed={home.id} />
        <div className={classes.badges}>
          {isNew(home) && (
            <Badge color="teal" variant="filled" size="sm">
              New
            </Badge>
          )}
          <Badge color="dark" variant="white" size="sm">
            {home.type}
          </Badge>
        </div>
        <ActionIcon
          className={classes.save}
          variant="subtle"
          color={saved ? "red" : "gray"}
          radius="xl"
          size="lg"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${home.title} from saved homes` : `Save ${home.title}`}
          onClick={() => onToggleSave(home.id)}
        >
          {saved ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
        </ActionIcon>
      </div>

      <div className={classes.body}>
        <Text fz="xl" fw={700} lh={1.2}>
          {formatPrice(home.price)}
        </Text>
        <Text fw={600} mt={4} lh={1.3}>
          <Link href={`/homes/${home.id}`} className={classes.titleLink}>
            {home.title}
          </Link>
        </Text>
        <Text size="sm" c="dimmed" mt={2}>
          {home.district}, Lisbon
        </Text>

        <div className={classes.facts}>
          <Text size="sm" className={classes.fact}>
            <IconBed size={16} aria-hidden="true" />
            {bedsLabel(home.beds)}
          </Text>
          <Text size="sm" className={classes.fact}>
            <IconBath size={16} aria-hidden="true" />
            {home.baths} bath{home.baths === 1 ? "" : "s"}
          </Text>
          <Text size="sm" className={classes.fact}>
            <IconRuler2 size={16} aria-hidden="true" />
            {home.area_m2} m²
          </Text>
        </div>
      </div>
    </Card>
  );
}
