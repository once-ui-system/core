"use client";

import { CondensedTShirtSizes } from "@/types";
import { Column, Media, Text, Row, Card, Skeleton } from ".";
import { useOgData } from "../hooks/useFetchOg";
import { useMemo } from "react";

export interface OgServiceConfig {
  proxyImageUrl?: (url: string) => string;
  proxyFaviconUrl?: (url: string) => string;
  fetchOgUrl?: string;
  proxyOgUrl?: string;
}

export interface OgData {
  title: string;
  description: string;
  faviconUrl: string;
  image: string;
  url: string;
}

interface OgCardProps extends Omit<React.ComponentProps<typeof Card>, "title"> {
  url?: string;
  sizes?: string;
  size?: CondensedTShirtSizes;
  ogData?: Partial<OgData> | null;
  direction?: "column" | "row" | "column-reverse" | "row-reverse";
  serviceConfig?: OgServiceConfig;
  title?: string | false;
  description?: string | false;
  favicon?: string | false;
  image?: string | false;
  cardUrl?: string | false;
}

const formatDisplayUrl = (url: string | undefined): string => {
  if (!url) return "";

  try {
    const urlObj = new URL(url);

    let domain = urlObj.hostname;

    domain = domain.replace(/^www\./, "");

    return domain;
  } catch (error) {
    let formattedUrl = url.replace(/^https?:\/\//, "");
    formattedUrl = formattedUrl.replace(/^www\./, "");

    formattedUrl = formattedUrl.split("/")[0];

    return formattedUrl;
  }
};

const getFaviconUrl = (url: string | undefined, proxyFn?: (url: string) => string): string => {
  if (!url) return "";

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    const faviconSourceUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // Use the provided proxy function or return the favicon URL directly
    return proxyFn ? proxyFn(faviconSourceUrl) : faviconSourceUrl;
  } catch (error) {
    return "";
  }
};

const OgCard = ({
  url,
  ogData: providedOgData,
  direction = "column",
  sizes = "320px",
  size = "m",
  serviceConfig = {},
  title,
  description,
  favicon,
  image,
  cardUrl,
  ...card
}: OgCardProps) => {
  const { ogData: fetchedOgData, loading } = useOgData(
    url || null,
    serviceConfig.fetchOgUrl,
    serviceConfig.proxyOgUrl,
  );
  const data = providedOgData || fetchedOgData;

  // Resolve content based on props
  const resolvedTitle = useMemo(() => {
    if (title === false) return null;
    if (typeof title === "string") return title;
    return data?.title;
  }, [title, data?.title]);

  const resolvedDescription = useMemo(() => {
    if (description === false) return null;
    if (typeof description === "string") return description;
    return data?.description;
  }, [description, data?.description]);

  const resolvedFavicon = useMemo(() => {
    if (favicon === false) return null;
    if (typeof favicon === "string") return favicon;
    return (
      data?.faviconUrl || (data?.url ? getFaviconUrl(data.url, serviceConfig.proxyFaviconUrl) : "")
    );
  }, [favicon, data?.faviconUrl, data?.url, serviceConfig.proxyFaviconUrl]);

  const resolvedImage = useMemo(() => {
    if (image === false) return null;
    if (typeof image === "string") return image;
    return data?.image
      ? serviceConfig.proxyImageUrl
        ? serviceConfig.proxyImageUrl(data.image)
        : data.image
      : "";
  }, [image, data?.image, serviceConfig.proxyImageUrl]);

  const resolvedUrl = useMemo(() => {
    if (cardUrl === false) return null;
    if (typeof cardUrl === "string") return cardUrl;
    return data?.url;
  }, [cardUrl, data?.url]);

  // With our updated useOgData hook, images are already proxied through the API
  // We only need additional proxying if a custom proxyImageUrl function is provided
  const proxiedImageUrl = useMemo(() => {
    return resolvedImage || "";
  }, [resolvedImage]);

  if (!loading && (!data || (!resolvedImage && !resolvedTitle))) {
    return null;
  }

  return (
    <Card
      href={resolvedUrl || undefined}
      direction={direction}
      fillWidth
      vertical={direction === "row" || direction === "row-reverse" ? "center" : undefined}
      gap="4"
      radius="l"
      background="surface"
      border="neutral-alpha-medium"
      {...card}
    >
      {resolvedImage !== null && (proxiedImageUrl || loading) && (
        <Media
          minWidth={direction === "row" || direction === "row-reverse" ? 16 : undefined}
          maxWidth={direction === "row" || direction === "row-reverse" ? 24 : undefined}
          loading={loading}
          radius="l"
          sizes={sizes}
          aspectRatio="16/9"
          border="neutral-alpha-weak"
          src={proxiedImageUrl}
        />
      )}
      <Column
        fillWidth
        paddingX={size === "s" ? "12" : size === "m" ? "20" : "32"}
        paddingY={size === "s" ? "12" : size === "m" ? "16" : "24"}
        gap={size === "s" || size === "m" ? "8" : "20"}
      >
        {resolvedFavicon !== null && (
          <Row fillWidth gap="8" vertical="center">
            <Media
              aspectRatio="1/1"
              sizes="24px"
              src={resolvedFavicon}
              loading={loading}
              minWidth="16"
              maxWidth="16"
              fillWidth={false}
              radius="xs"
              border="neutral-alpha-weak"
            />
            {resolvedUrl &&
              (loading ? (
                <Skeleton shape="line" width="xs" height="xs" />
              ) : (
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {formatDisplayUrl(resolvedUrl)}
                </Text>
              ))}
          </Row>
        )}
        <Column fillWidth gap={size === "s" ? "4" : size === "m" ? "8" : "12"}>
          {resolvedTitle !== null &&
            (loading ? (
              <Skeleton shape="line" width="s" height="s" />
            ) : (
              resolvedTitle && (
                <Text
                  variant={
                    size === "s"
                      ? "label-default-s"
                      : size === "m"
                        ? "label-default-m"
                        : "label-default-l"
                  }
                >
                  {resolvedTitle}
                </Text>
              )
            ))}
          {resolvedDescription !== null &&
            (loading ? (
              <Column fillWidth paddingY="8" gap="8">
                <Skeleton shape="line" width="xl" height="xs" />
                <Skeleton shape="line" width="l" height="xs" />
              </Column>
            ) : resolvedDescription ? (
              <Text
                variant={
                  size === "s"
                    ? "label-default-s"
                    : size === "m"
                      ? "label-default-m"
                      : "label-default-l"
                }
                onBackground="neutral-weak"
              >
                {resolvedDescription}
              </Text>
            ) : null)}
        </Column>
      </Column>
    </Card>
  );
};

OgCard.displayName = "OgCard";
export { OgCard };
