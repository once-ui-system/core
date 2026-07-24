"use client";

import React, { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { Flex, IconButton, Row, Text } from ".";
import styles from "./MediaVideoPlayer.module.scss";

interface MediaVideoPlayerProps {
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

const MediaVideoPlayer: React.FC<MediaVideoPlayerProps> = ({
  src,
  autoplay = false,
  loop = false,
  muted: mutedProp = true,
  objectFit = "cover",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isSeekingRef = useRef(false);

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
        await video.play();
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

  const seekToPosition = useCallback((clientX: number) => {
    const video = videoRef.current;
    const progressTrack = progressRef.current;
    if (!video || !progressTrack || !video.duration) {
      return;
    }

    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    syncPlaybackState();
  }, [syncPlaybackState]);

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
      video.play().catch(() => {
        setIsPlaying(false);
        setControlsVisible(true);
      });
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
    <div
      ref={containerRef}
      className={classNames(styles.container, className)}
      tabIndex={0}
      role="group"
      aria-label="Video player"
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={src}
        loop={loop}
        muted={isMuted}
        playsInline
        preload="metadata"
        style={{ objectFit }}
      />

      <div
        className={classNames(
          styles.overlay,
          controlsVisible || !isPlaying ? styles.visible : styles.hidden,
        )}
      >
        <div className={styles.gradient} />

        {showCenterPlay && (
          <div className={styles.centerPlay} data-video-control>
            <Flex
              center
              radius="full"
              className={styles.centerPlayButton}
              style={{ width: "4rem", height: "4rem" }}
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
          className={styles.controls}
          data-video-control
        >
          <Row
            ref={progressRef}
            fillWidth
            radius="full"
            className={styles.progressTrack}
            style={{ background: "rgba(255, 255, 255, 0.25)" }}
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
              className={styles.progressFill}
              style={{ width: `${progress}%`, background: "var(--brand-solid-strong)" }}
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
                className={styles.time}
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
                tooltipPosition="top"
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation();
                  toggleFullscreen();
                }}
              />
            </Row>
          </Row>
        </Flex>
      </div>
    </div>
  );
};

MediaVideoPlayer.displayName = "MediaVideoPlayer";
export { MediaVideoPlayer };
