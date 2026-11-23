import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  IconButton,
  type IconName,
  Logo,
  Row,
  Tag,
  Text,
  ThemeSwitcher,
} from "@once-ui-system/core";
import classNames from "clsx";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import styles from "./FamilyFooter.module.scss";
import {
  type FamilyParent,
  type FamilyProduct,
  familyHref,
  familyParent,
  familyProducts,
  familySiblings,
} from "./family.js";
import { mergeLabels } from "./internal/labels.js";

export interface FamilyFooterLink {
  label: string;
  href: string;
  /** A short tag after the label, such as "New". */
  tag?: string;
}

export interface FamilyFooterColumn {
  title: string;
  links: FamilyFooterLink[];
}

export interface FamilyFooterSocial {
  /** An icon registered with the app's IconProvider. */
  icon: IconName;
  /** The accessible name and tooltip, such as "GitHub". */
  label: string;
  href: string;
}

/** The words the footer writes itself. Omitted fields keep the English default. */
export interface FamilyFooterLabels {
  /** The family row's title. Defaults to `"More from <parent>"`. */
  moreFrom?: string;
  /** Before the parent's name in the co-brand bar. Defaults to `"A product by"`. */
  productBy?: string;
  /** The credit at the end of the bar. Defaults to `"Built with Once UI"`. */
  builtWith?: string;
  /** The family row's landmark name. Defaults to `"Other products"`. */
  family?: string;
  /** The link columns' landmark name. Defaults to `"Footer"`. */
  navigation?: string;
  /** The link to the parent's shared legal page. Defaults to `"Legal"`. */
  legal?: string;
}

export interface FamilyFooterBrand {
  /** The product's name, used for the default logo and the logo's link. */
  name: string;
  /** The product's logo; defaults to its name with a monogram on a brand tile. */
  logo?: ReactNode;
  /** Where the logo links. Defaults to `"/"`. */
  href?: string;
  /** The one-line promise under the logo. */
  tagline?: ReactNode;
  /** The primary button. */
  action?: { label: string; href: string };
  /** The brand's own extra: a big wordmark, the mascot, a newsletter field. */
  extra?: ReactNode;
}

export interface FamilyFooterProps extends Omit<ComponentProps<typeof Column>, "children"> {
  /** The brand band: logo, promise, primary button and an optional extra. */
  brand: FamilyFooterBrand;
  /** The product the footer is on: left out of the family row and named in each sibling's `ref`. */
  current?: string;
  /** Up to five link columns; any after the fifth are dropped. */
  columns?: FamilyFooterColumn[];
  /** The family. Defaults to `familyProducts`. */
  products?: FamilyProduct[];
  /** The company behind the family. Defaults to `familyParent` (Dopler). */
  parent?: FamilyParent;
  /** The legal entity after the year, such as `"Dopler Kft."`. Defaults to the parent's name. */
  legal?: string;
  /** The copyright year. Defaults to this year. */
  year?: number;
  social?: FamilyFooterSocial[];
  /** The site's language switch, such as its LocaleSwitcher, drawn in the co-brand bar. */
  languageSwitch?: ReactNode;
  /** Shows the theme switch in the co-brand bar. Defaults to `true`. */
  themeSwitch?: boolean;
  /** Shows "Built with Once UI". Defaults to `true`, except on Once UI's own site. */
  builtWith?: boolean;
  /**
   * Drawn behind the brand band and the columns, full bleed: a glow, a
   * drawing, a background effect. It is decorative and takes no pointer.
   */
  decoration?: ReactNode;
  /** How wide the content runs: `"s"`, `"m"` or `"l"` (default). */
  width?: "s" | "m" | "l";
  labels?: FamilyFooterLabels;
}

/** Hungarian labels for the Dopler family. */
export const familyFooterLabelsHu: FamilyFooterLabels = {
  moreFrom: "A Dopler további termékei",
  productBy: "A Dopler terméke",
  builtWith: "Once UI-jal készült",
  family: "További termékek",
  navigation: "Lábléc",
  legal: "Jogi információk",
};

/** A mark from a path, a node or nothing (then the first letter), in a square of `size`. */
function Mark({
  mark,
  name,
  color,
  size,
  className,
}: {
  mark?: string | ReactNode;
  name: string;
  color?: string;
  size: number;
  className?: string;
}) {
  const box: CSSProperties = { width: size, height: size };
  if (typeof mark === "string") {
    return (
      <img className={classNames(styles.markImage, className)} src={mark} alt="" style={box} />
    );
  }
  if (mark) {
    return (
      <span className={classNames(styles.markNode, className)} style={box} aria-hidden="true">
        {mark}
      </span>
    );
  }
  return (
    <span
      className={classNames(styles.monogram, className)}
      style={{ ...box, ...(color ? { ["--family-mark" as string]: color } : null) }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * The footer every product of a family shares: the same four bands in the
 * same order on every site. The brand band (logo, promise, primary button and
 * an optional extra) and the link columns are the brand's to shape and take
 * its colours from the theme; the family row ("More from Dopler", one tile
 * per live sibling) and the co-brand bar ("A product by Dopler", ©, language,
 * theme, social, "Built with Once UI") look the same everywhere, so a visitor
 * knows the products belong together.
 */
export function FamilyFooter({
  brand,
  current,
  columns = [],
  products = familyProducts,
  parent = familyParent,
  legal,
  year,
  social = [],
  languageSwitch,
  themeSwitch = true,
  builtWith,
  decoration,
  width = "l",
  labels,
  className,
  ...rest
}: FamilyFooterProps) {
  const words = mergeLabels(
    {
      moreFrom: `More from ${parent.name}`,
      productBy: "A product by",
      builtWith: "Built with Once UI",
      family: "Other products",
      navigation: "Footer",
      legal: "Legal",
    },
    labels,
  );
  const siblings = familySiblings(products, current);
  const links = columns.slice(0, 5);
  const showBuiltWith = builtWith ?? current !== "once-ui";
  const shownYear = year ?? new Date().getFullYear();
  const productBy = labels?.productBy;
  // A translation that already names the parent ("A Dopler terméke") is
  // shown as it is; the English default gets the name after it.
  const productByNamesParent = Boolean(productBy?.includes(parent.name));

  return (
    <Column
      as="footer"
      fillWidth
      horizontal="center"
      className={classNames(styles.footer, className)}
      {...rest}
    >
      <Column fillWidth horizontal="center" position="relative" className={styles.brandArea}>
        {decoration && (
          <div className={styles.decoration} aria-hidden="true">
            {decoration}
          </div>
        )}
        <Column
          fillWidth
          maxWidth={width}
          paddingX="24"
          paddingTop="80"
          paddingBottom="48"
          gap="48"
        >
          <Row
            fillWidth
            gap="32"
            horizontal="between"
            vertical="end"
            s={{ direction: "column", horizontal: "start", vertical: "start" }}
          >
            <Column gap="16" flex={1} style={{ maxWidth: "28rem" }}>
              {brand.logo ?? (
                <Logo text={brand.name} monogram tone="brand" size="m" href={brand.href ?? "/"} />
              )}
              {brand.tagline && (
                <Text
                  as="p"
                  textVariant="body-default-l"
                  onBackground="neutral-weak"
                  wrap="balance"
                >
                  {brand.tagline}
                </Text>
              )}
            </Column>
            {brand.action && (
              <Button href={brand.action.href} size="l" arrowIcon>
                {brand.action.label}
              </Button>
            )}
          </Row>
          {brand.extra}
          {links.length > 0 && (
            <nav aria-label={words.navigation} className={styles.nav}>
              <Grid
                fillWidth
                gap="32"
                columns={links.length as 1 | 2 | 3 | 4 | 5}
                m={{ columns: Math.min(links.length, 3) as 1 | 2 | 3 }}
                s={{ columns: 2 }}
              >
                {links.map((column) => (
                  <Column key={column.title} gap="12">
                    <Heading as="h2" textVariant="label-strong-s" onBackground="neutral-strong">
                      {column.title}
                    </Heading>
                    <Column as="ul" gap="8" className={styles.list}>
                      {column.links.map((link) => (
                        <Row as="li" key={`${link.label}-${link.href}`} gap="8" vertical="center">
                          <a href={link.href} className={styles.link}>
                            <Text textVariant="body-default-s" onBackground="neutral-weak">
                              {link.label}
                            </Text>
                          </a>
                          {link.tag && (
                            <Tag size="s" tone="brand">
                              {link.tag}
                            </Tag>
                          )}
                        </Row>
                      ))}
                    </Column>
                  </Column>
                ))}
              </Grid>
            </nav>
          )}
        </Column>
      </Column>

      {siblings.length > 0 && (
        <Row fillWidth horizontal="center" className={styles.family}>
          <Column fillWidth maxWidth={width} paddingX="24" paddingY="32" gap="16">
            <Heading as="h2" textVariant="label-default-s" onBackground="neutral-weak">
              {words.moreFrom}
            </Heading>
            <ul className={styles.tiles} aria-label={words.family}>
              {siblings.map((product) => (
                <li key={product.id}>
                  <a className={styles.tile} href={familyHref(product.href, current)}>
                    <Mark mark={product.mark} name={product.name} color={product.color} size={32} />
                    <span className={styles.tileText}>
                      <Text textVariant="label-strong-s" onBackground="neutral-strong">
                        {product.name}
                      </Text>
                      <Text textVariant="body-default-xs" onBackground="neutral-weak">
                        {product.line}
                      </Text>
                    </span>
                    <Icon name="arrowUpRight" size="xs" className={styles.tileArrow} decorative />
                  </a>
                </li>
              ))}
            </ul>
          </Column>
        </Row>
      )}

      <Row fillWidth horizontal="center" className={styles.bar}>
        <Row
          fillWidth
          maxWidth={width}
          paddingX="24"
          paddingY="20"
          gap="16"
          horizontal="between"
          vertical="center"
          wrap
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <a className={styles.parent} href={familyHref(parent.href, current)}>
            <Mark mark={parent.mark} name={parent.name} size={20} className={styles.parentMark} />
            <Text textVariant="label-default-s" onBackground="neutral-medium">
              {productByNamesParent ? (
                productBy
              ) : (
                <>
                  {words.productBy}{" "}
                  <Text as="span" onBackground="neutral-strong">
                    {parent.name}
                  </Text>
                </>
              )}
            </Text>
          </a>
          <Row gap="16" vertical="center" wrap>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              © {shownYear} {legal ?? parent.name}
            </Text>
            {parent.legalHref && (
              <a href={parent.legalHref} className={styles.link}>
                <Text textVariant="label-default-s" onBackground="neutral-medium">
                  {words.legal}
                </Text>
              </a>
            )}
            {languageSwitch}
            {themeSwitch && <ThemeSwitcher />}
            {social.length > 0 && (
              <Row gap="4">
                {social.map((item) => (
                  <IconButton
                    key={`${item.label}-${item.href}`}
                    icon={item.icon}
                    href={item.href}
                    tooltip={item.label}
                    aria-label={item.label}
                    size="s"
                    variant="tertiary"
                  />
                ))}
              </Row>
            )}
            {showBuiltWith && (
              <a href={familyHref("https://once-ui.com", current)} className={styles.link}>
                <Text textVariant="label-default-s" onBackground="neutral-medium">
                  {words.builtWith}
                </Text>
              </a>
            )}
          </Row>
        </Row>
      </Row>
    </Column>
  );
}
