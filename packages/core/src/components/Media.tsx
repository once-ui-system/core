"use client";

import React, { CSSProperties, useState, useRef, useEffect, ReactNode } from "react";
import { Column, Flex, Row, Skeleton, ScrollLock } from ".";
import { MediaVideoPlayer } from "./MediaVideoPlayer";
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
  sizes?: string | number;
  priority?: boolean;
  caption?: ReactNode;
  fill?: boolean;
  fillWidth?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  sound?: boolean;
  controls?: boolean;
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
  loop = true,
  autoplay = true,
  sound = false,
  controls = false,
  style,
  className,
  ...rest
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = () => {
    if (canEnlarge) {
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
    if (!match) return "";

    const id = match[1];
    let embedUrl = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;

    if (!controls) embedUrl += "&controls=0";
    if (autoplay) embedUrl += "&autoplay=1";
    if (!sound) embedUrl += "&mute=1";
    if (loop) embedUrl += `&loop=1&playlist=${id}`;

    return embedUrl;
  };

  const isVideoUrl = (url: string) => {
    const videoExtensions = /\.(mp4|webm|mov|avi|ogv|m4v|mkv|flv|wmv|3gp|3g2)(\?.*)?$/i;
    return videoExtensions.test(url);
  };

  const isVideo = isVideoUrl(src);
  const isYouTube = isYouTubeVideo(src);
  const useCustomVideoControls = isVideo && controls;
  const canEnlarge = enlarge && !useCustomVideoControls;
  const resolvedSizes =
    typeof sizes === "number"
      ? `(max-width: ${sizes}px) 100vw, ${sizes}px`
      : sizes;

  return (
    <>
      <ScrollLock enabled={isEnlarged} />
      {isEnlarged && canEnlarge && typeof document !== 'undefined' && (
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
          className={classNames(canEnlarge && !isEnlarged ? "cursor-zoom-in" : canEnlarge && isEnlarged ? "cursor-zoom-out" : undefined, className)}
          {...rest}
        >
          {loading && <Skeleton shape="block" radius={rest.radius} />}
          {!loading && isVideo && useCustomVideoControls && (
            <MediaVideoPlayer
              src={src}
              autoplay={autoplay}
              loop={loop}
              muted={!sound}
              objectFit={objectFit}
            />
          )}
          {!loading && isVideo && !useCustomVideoControls && (
            <video
              src={src}
              autoPlay={autoplay}
              loop={loop}
              muted={!sound}
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              sizes={isEnlarged ? "100vw" : resolvedSizes}
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
