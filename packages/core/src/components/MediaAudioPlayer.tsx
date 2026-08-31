"use client";

import type React from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import classNames from "clsx";
import { Column, IconButton, Row, Text } from ".";
import styles from "./MediaAudioPlayer.module.scss";

interface MediaAudioPlayerProps extends Omit<React.ComponentProps<typeof Column>, "onTimeUpdate"> {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  /** Accessible name for the player group. */
  label?: string;
  /**
   * Fires on every timeupdate with the current position in seconds. This is
   * what a narration view subscribes to in order to highlight the paragraph
   * being read — the player owns playback, the caller owns what it means.
   */
  onTimeUpdate?: (currentTime: number) => void;
  onPlayingChange?: (playing: boolean) => void;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
};

/**
 * An audio player: play/pause, a scrubbable progress bar and elapsed/total
 * time. The visual counterpart of `MediaVideoPlayer`, and like it, imported
 * from the `./components/*` subpath rather than the root barrel.
 *
 * `onTimeUpdate` exists so a caller can synchronise something with playback —
 * narration highlighting, a transcript, chapter markers — without the player
 * needing to know what is being synchronised.
 */
const MediaAudioPlayer = forwardRef<HTMLDivElement, MediaAudioPlayerProps>(
  (
    {
      src,
      autoplay = false,
      loop = false,
      label = "Audio player",
      onTimeUpdate,
      onPlayingChange,
      className,
      ...column
    },
    ref,
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const [playing, setPlaying] = useState(autoplay);
    const [seeking, setSeeking] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

    const togglePlay = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        void audio.play();
      } else {
        audio.pause();
      }
    }, []);

    /** Map a pointer x within the track to a position, and seek there. */
    const seekToClientX = useCallback(
      (clientX: number) => {
        const audio = audioRef.current;
        const track = trackRef.current;
        if (!audio || !track || duration <= 0) return;
        const rect = track.getBoundingClientRect();
        if (rect.width === 0) return;
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        audio.currentTime = ratio * duration;
        setCurrentTime(audio.currentTime);
      },
      [duration],
    );

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const onTime = () => {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      };
      const onLoaded = () => setDuration(audio.duration);
      const onPlay = () => {
        setPlaying(true);
        onPlayingChange?.(true);
      };
      const onPause = () => {
        setPlaying(false);
        onPlayingChange?.(false);
      };

      audio.addEventListener("timeupdate", onTime);
      audio.addEventListener("loadedmetadata", onLoaded);
      audio.addEventListener("durationchange", onLoaded);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);

      return () => {
        audio.removeEventListener("timeupdate", onTime);
        audio.removeEventListener("loadedmetadata", onLoaded);
        audio.removeEventListener("durationchange", onLoaded);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
      };
    }, [onTimeUpdate, onPlayingChange]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        audio.currentTime = Math.min(duration, audio.currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        togglePlay();
      }
    };

    return (
      <Column
        ref={ref}
        fillWidth
        gap="8"
        role="group"
        aria-label={label}
        className={className}
        {...column}
      >
        <audio ref={audioRef} src={src} loop={loop} autoPlay={autoplay} preload="metadata">
          <track kind="captions" />
        </audio>
        <Row fillWidth gap="12" vertical="center">
          <IconButton
            variant="secondary"
            icon={playing ? "pause" : "play"}
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
          />
          <Row
            ref={trackRef}
            fillWidth
            radius="full"
            background="neutral-alpha-medium"
            overflow="hidden"
            vertical="center"
            className={classNames(styles.progressTrack, seeking && styles.seeking)}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onKeyDown={handleKeyDown}
            onPointerDown={(event: React.PointerEvent) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setSeeking(true);
              seekToClientX(event.clientX);
            }}
            onPointerMove={(event: React.PointerEvent) => {
              if (seeking) seekToClientX(event.clientX);
            }}
            onPointerUp={(event: React.PointerEvent) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              setSeeking(false);
            }}
            onPointerCancel={() => setSeeking(false)}
          >
            <Row
              className={styles.progressFill}
              radius="full"
              style={{ width: `${progress}%` }}
            />
            <Row
              className={styles.progressHandle}
              radius="full"
              position="absolute"
              style={{ left: `calc(${progress}% - 0.375rem)` }}
            />
          </Row>
          <Text
            variant="body-default-xs"
            onBackground="neutral-weak"
            wrap="nowrap"
            className={styles.time}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </Row>
      </Column>
    );
  },
);

MediaAudioPlayer.displayName = "MediaAudioPlayer";

export { MediaAudioPlayer };
export type { MediaAudioPlayerProps };
