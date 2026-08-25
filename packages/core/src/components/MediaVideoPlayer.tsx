"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Row } from "./Row";
import { Text } from "./Text";

export const mediaVideoPlayerVariants = cva(
  "relative w-full h-full bg-neutral-solid-strong outline-none [&:fullscreen_video]:object-contain [&:-webkit-full-screen_video]:object-contain",
);

export const mediaVideoPlayerOverlayVariants = cva(
  "absolute inset-0 flex flex-col justify-end pointer-events-none transition-opacity duration-micro-medium",
  {
    variants: {
      visible: {
        true: "opacity-100",
        false: "opacity-0",
      },
    },
    defaultVariants: {
      visible: true,
    },
  },
);

export const mediaVideoPlayerProgressTrackVariants = cva(
  "h-[0.1875rem] cursor-pointer transition-[height] duration-micro-short hover:h-[0.3125rem]",
);

export const mediaVideoPlayerProgressFillVariants = cva(
  "transition-[width] duration-[50ms] ease-linear",
);

export interface MediaVideoPlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  objectFit?: CSSProperties["objectFit"];
  className?: string;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const MediaVideoPlayer = forwardRef<HTMLDivElement, MediaVideoPlayerProps>(
  (
    {
      src,
      autoplay = false,
      loop = false,
      muted: mutedProp = true,
      objectFit = "cover",
      className,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const isSeekingRef = useRef(false);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [isMuted, setIsMuted] = useState(mutedProp);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    const clearHideControlsTimeout = useCallback(() => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = undefined;
      }
    }, []);

    const scheduleHideControls = useCallback(() => {
      clearHideControlsTimeout();

      if (!videoRef.current || videoRef.current.paused) {
        setControlsVisible(true);
        return;
      }

      hideControlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2500);
    }, [clearHideControlsTimeout]);

    const revealControls = useCallback(() => {
      setControlsVisible(true);
      scheduleHideControls();
    }, [scheduleHideControls]);

    const syncPlaybackState = useCallback(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      setIsPlaying(!video.paused);
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    }, []);

    const togglePlay = useCallback(async () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      if (video.paused) {
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch {
          return;
        }
      } else {
        video.pause();
      }

      syncPlaybackState();
      revealControls();
    }, [revealControls, syncPlaybackState]);

    const toggleMute = useCallback(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.muted = !video.muted;
      setIsMuted(video.muted);
      revealControls();
    }, [revealControls]);

    const toggleFullscreen = useCallback(async () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await container.requestFullscreen();
        }
      } catch {
        return;
      }

      revealControls();
    }, [revealControls]);

    const seekToPosition = useCallback(
      (clientX: number) => {
        const video = videoRef.current;
        const progressTrack = progressRef.current;
        if (!video || !progressTrack || !video.duration) {
          return;
        }

        const rect = progressTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        video.currentTime = ratio * video.duration;
        syncPlaybackState();
      },
      [syncPlaybackState],
    );

    const handleProgressPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      isSeekingRef.current = true;
      progressRef.current?.setPointerCapture(event.pointerId);
      seekToPosition(event.clientX);
      revealControls();
    };

    const handleProgressPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isSeekingRef.current) {
        return;
      }

      seekToPosition(event.clientX);
    };

    const handleProgressPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isSeekingRef.current) {
        return;
      }

      isSeekingRef.current = false;
      progressRef.current?.releasePointerCapture(event.pointerId);
      scheduleHideControls();
    };

    const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest("[data-video-control]")) {
        return;
      }

      togglePlay();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlay();
          break;
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            syncPlaybackState();
            revealControls();
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoRef.current.duration || 0,
              videoRef.current.currentTime + 5,
            );
            syncPlaybackState();
            revealControls();
          }
          break;
        default:
          break;
      }
    };

    useEffect(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.muted = mutedProp;

      const handleLoadedMetadata = () => syncPlaybackState();
      const handleTimeUpdate = () => syncPlaybackState();
      const handlePlay = () => {
        setIsPlaying(true);
        scheduleHideControls();
      };
      const handlePause = () => {
        setIsPlaying(false);
        setControlsVisible(true);
        clearHideControlsTimeout();
      };
      const handleVolumeChange = () => setIsMuted(video.muted);

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("volumechange", handleVolumeChange);

      if (autoplay) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false);
            setControlsVisible(true);
          });
        }
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("volumechange", handleVolumeChange);
      };
    }, [autoplay, clearHideControlsTimeout, mutedProp, scheduleHideControls, syncPlaybackState]);

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }, []);

    useEffect(() => {
      return () => {
        clearHideControlsTimeout();
      };
    }, [clearHideControlsTimeout]);

    const showCenterPlay = !isPlaying && controlsVisible;

    return (
      <section
        ref={containerRef}
        className={cn(mediaVideoPlayerVariants(), className)}
        aria-label="Video player"
        onMouseMove={revealControls}
        onTouchStart={revealControls}
        onClick={handleContainerClick}
        onKeyDown={handleKeyDown}
      >
        <video
          ref={videoRef}
          className="w-full h-full block"
          src={src}
          loop={loop}
          muted={isMuted}
          playsInline
          preload="metadata"
          style={{ objectFit }}
        />

        <div
          className={cn(
            mediaVideoPlayerOverlayVariants({
              visible: controlsVisible || !isPlaying,
            }),
          )}
        >
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.25)_35%,transparent_65%)]" />

          {showCenterPlay && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              data-video-control
            >
              <Flex
                center
                radius="full"
                className="[backdrop-filter:blur(0.5rem)] bg-[rgba(0,0,0,0.45)] border border-[rgba(255,255,255,0.12)] w-64 h-64"
              >
                <IconButton
                  variant="ghost"
                  icon="play"
                  tooltip="Play"
                  tooltipPosition="top"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    togglePlay();
                  }}
                  data-video-control
                />
              </Flex>
            </div>
          )}

          <Flex
            fillWidth
            direction="column"
            gap="8"
            paddingX="12"
            paddingBottom="12"
            className="relative z-[1] pointer-events-auto"
            data-video-control
          >
            <Row
              ref={progressRef}
              fillWidth
              radius="full"
              className={mediaVideoPlayerProgressTrackVariants()}
              style={{ background: "var(--neutral-alpha-medium)" }}
              onPointerDown={handleProgressPointerDown}
              onPointerMove={handleProgressPointerMove}
              onPointerUp={handleProgressPointerUp}
              onPointerCancel={handleProgressPointerUp}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <Row
                radius="full"
                fillHeight
                className={mediaVideoPlayerProgressFillVariants()}
                style={{
                  width: `${progress}%`,
                  background: "var(--brand-solid-strong)",
                }}
              />
            </Row>

            <Row fillWidth vertical="center" horizontal="between" gap="8">
              <Row vertical="center" gap="4">
                <IconButton
                  variant="ghost"
                  icon={isPlaying ? "pause" : "play"}
                  tooltip={isPlaying ? "Pause" : "Play"}
                  tooltipPosition="top"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    togglePlay();
                  }}
                />

                <Text
                  variant="label-default-xs"
                  onSolid="neutral-weak"
                  className="[font-variant-numeric:tabular-nums] select-none"
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </Row>

              <Row vertical="center" gap="4">
                <IconButton
                  variant="ghost"
                  icon={isMuted ? "volumeOff" : "volume"}
                  tooltip={isMuted ? "Unmute" : "Mute"}
                  tooltipPosition="top"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    toggleMute();
                  }}
                />

                <IconButton
                  variant="ghost"
                  icon={isFullscreen ? "minimize" : "maximize"}
                  tooltip={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    toggleFullscreen();
                  }}
                />
              </Row>
            </Row>
          </Flex>
        </div>
      </section>
    );
  },
);

MediaVideoPlayer.displayName = "MediaVideoPlayer";

export { MediaVideoPlayer };
