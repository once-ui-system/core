"use client";

import React, { CSSProperties, useState, useRef, useEffect, ReactNode } from "react";
import { Column, Flex, Row, Skeleton } from ".";
import Image from "next/image";
import classNames from "classnames";

export interface MediaProps extends React.ComponentProps<typeof Flex> {
  aspectRatio?: string;
  height?: number;
  alt?: string;
  loading?: boolean;
  objectFit?: CSSProperties["objectFit"];
  enlarge?: boolean;
  src: string;
  unoptimized?: boolean;
  sizes?: string;
  priority?: boolean;
  caption?: ReactNode;
  fill?: boolean;
  fillWidth?: boolean;
  style?: CSSProperties;
  className?: string;
}

const Media: React.FC<MediaProps> = ({
  src,
  alt = "",
  fillWidth = true,
  fill = false,
  loading = false,
  enlarge = false,
  unoptimized = false,
  objectFit = "cover",
  sizes = "100vw",
  aspectRatio = "original",
  height,
  priority,
  caption,
  style,
  className,
  ...rest
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = () => {
    if (enlarge) {
      if (!isEnlarged) {
        setIsEnlarged(true);
      } else {
        setIsEnlarged(false);
      }
    }
  };

  const handleOverlayClick = () => {
    if (isEnlarged) {
      setIsEnlarged(false);
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isEnlarged) {
        setIsEnlarged(false);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (isEnlarged) {
        setIsEnlarged(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isEnlarged]);

  useEffect(() => {
    if (isEnlarged) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEnlarged]);

  const calculateTransform = () => {
    if (!imageRef.current) return {};

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = window.innerWidth / rect.width;
    const scaleY = window.innerHeight / rect.height;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    const translateX = (window.innerWidth - rect.width) / 2 - rect.left;
    const translateY = (window.innerHeight - rect.height) / 2 - rect.top;

    return {
      transform: isEnlarged
        ? `translate(${translateX}px, ${translateY}px) scale(${scale})`
        : "translate(0, 0) scale(1)",
      transition: "all 0.3s ease-in-out",
      zIndex: isEnlarged ? 10 : undefined,
    };
  };

  const isYouTubeVideo = (url: string) => {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match
      ? `https://www.youtube.com/embed/${match[1]}?controls=0&rel=0&modestbranding=1`
      : "";
  };

  const isVideo = src?.endsWith(".mp4");
  const isYouTube = isYouTubeVideo(src);

  return (
    <>
      {isEnlarged && enlarge && typeof document !== 'undefined' && (
        <Flex
          center
          position="fixed"
          background="overlay"
          pointerEvents="auto"
          onClick={handleOverlayClick}
          top="0"
          left="0"
          zIndex={9}
          opacity={100}
          cursor="interactive"
          transition="macro-medium"
          className="cursor-interactive"
          style={{
            backdropFilter: "blur(0.5rem)",
            width: "100vw",
            height: "100vh",
          }}
        />
      )}
      <>
        <Column
          as={caption ? "figure" : undefined}
          ref={imageRef}
          fillWidth
          overflow="hidden"
          zIndex={0}
          margin="0"
          style={{
            outline: "none",
            isolation: "isolate",
            height: aspectRatio === "original" ? undefined : aspectRatio ? "" : height ? `${height}rem` : "100%",
            aspectRatio: aspectRatio === "original" ? undefined : aspectRatio,
            borderRadius: isEnlarged ? "0" : undefined,
            ...calculateTransform(),
            ...style,
          }}
          onClick={handleImageClick}
          className={classNames(enlarge && !isEnlarged ? "cursor-zoom-in" : enlarge && isEnlarged ? "cursor-zoom-out" : undefined, className)}
          {...rest}
        >
          {loading && <Skeleton shape="block" radius={rest.radius} />}
          {!loading && isVideo && (
            <video
              src={src}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: objectFit,
              }}
            />
          )}
          {!loading && isYouTube && (
            <iframe
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl(src)}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                objectFit: objectFit,
              }}
            />
          )}
          {!loading && !isVideo && !isYouTube && (
            <Image
              src={src}
              alt={alt}
              sizes={isEnlarged ? "100vw" : sizes}
              priority={priority}
              unoptimized={unoptimized}
              fill={fill || !aspectRatio}
              width={fill ? undefined : 0}
              height={fill ? undefined : 0}
              style={{
                objectFit: objectFit,
                aspectRatio: fill ? undefined : aspectRatio,
                width: aspectRatio ? "100%" : undefined,
                height: aspectRatio ? "100%" : undefined,
              }}
            />
          )}
        </Column>
        {caption && (
          <Row
            as="figcaption"
            fillWidth
            textVariant="label-default-s"
            onBackground="neutral-weak"
            paddingY="12"
            paddingX="24"
            horizontal="center"
            align="center"
          >
            {caption}
          </Row>
        )}
      </>
    </>
  );
};

Media.displayName = "Media";
export { Media };
