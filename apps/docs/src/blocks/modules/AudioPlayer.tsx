"use client";

import { Button, Column, Icon, IconButton, Line, Row, Text } from "@once-ui-system/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { dev } from "@/utils/dev-logger";
import styles from "./AudioPlayer.module.css";

interface Chapter {
  start: number;
  title: string;
}

// Seeded pseudo-random function for consistent SSR/client values
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateBarHeights = (count: number): number[] => {
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    // Combine multiple sine waves for natural variation
    const wave1 = Math.sin(i * 0.15) * 30;
    const wave2 = Math.sin(i * 0.08) * 20;
    const wave3 = Math.sin(i * 0.3) * 15;
    const randomness = seededRandom(i * 12345) * 10; // Deterministic "randomness"

    // Base height + waves + randomness, clamped between 20-90%
    const height = Math.max(20, Math.min(90, 50 + wave1 + wave2 + wave3 + randomness));
    heights.push(height);
  }
  return heights;
};

export const AudioPlayer: React.FC<
  React.ComponentProps<typeof Row> & { audio: string; chapters?: Chapter[]; barCount?: number }
> = ({ audio, chapters = [], barCount = 70, ...flex }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Generate bar heights based on barCount prop
  const barHeights = useMemo(() => generateBarHeights(barCount), [barCount]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsAudioPlaying(false);
      audio.currentTime = 0;
      setProgress(0);
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    // Check if duration is already available
    if (audio.duration) {
      setDuration(audio.duration);
    }

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch((error) => {
          dev.log("Audio play failed:", error);
        });
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const container = containerRef.current;
    if (!audio || !container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audio.duration;

    audio.currentTime = newTime;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const seekToChapter = (startTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startTime;
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch((error) => {
          dev.log("Audio play failed:", error);
        });
    }
  };

  return (
    <>
      <audio ref={audioRef} src={audio} preload="metadata">
        <track kind="captions" />
      </audio>
      <Row gap="40" align="center" vertical="center" style={{ isolation: "isolate" }} {...flex}>
        <Button rounded onClick={toggleAudio} weight="default">
          <Row gap="8" vertical="center">
            <Icon size="xs" onSolid="brand-weak" name={isAudioPlaying ? "pause" : "play"} />
            <Row horizontal="center" width={3}>
              {isAudioPlaying ? "Pause" : "Play"}
            </Row>
          </Row>
        </Button>
        <Column fillWidth suppressHydrationWarning>
          <Row
            suppressHydrationWarning
            ref={containerRef}
            onClick={handleProgressClick}
            cursor={<Line vert height={3} />}
            fillWidth
            height="40"
            vertical="end"
            horizontal="between"
            position="relative"
          >
            {/* Border bars */}
            {barHeights.map((height, index) => (
              <Column
                suppressHydrationWarning
                key={`border-${index}`}
                width="2"
                radius="full"
                background="neutral-alpha-weak"
                style={{ height: `${height}%` }}
              />
            ))}

            <Row
              suppressHydrationWarning
              fillHeight
              position="absolute"
              left="0"
              top="0"
              bottom="0"
              style={{
                width: `${progress}%`,
                overflow: "hidden",
                transition: "width 0.1s linear",
                pointerEvents: "none",
              }}
            >
              <Row
                suppressHydrationWarning
                horizontal="between"
                vertical="end"
                style={{ minWidth: containerWidth }}
              >
                {barHeights.map((height, index) => (
                  <Column
                    suppressHydrationWarning
                    key={`fill-${index}`}
                    width="2"
                    radius="full"
                    solid="brand-strong"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </Row>
            </Row>
          </Row>
          {chapters.length > 0 && (
            <>
              <Row fillWidth gap="2" paddingTop="8">
                {chapters.map((chapter, index) => {
                  // Calculate chapter duration and width percentage
                  const nextChapterStart =
                    index < chapters.length - 1 ? chapters[index + 1].start : duration;
                  const chapterDuration = nextChapterStart - chapter.start;
                  const chapterWidthPercent = duration > 0 ? (chapterDuration / duration) * 100 : 0;

                  // Calculate chapter-specific progress
                  let chapterProgress = 0;
                  if (currentTime >= chapter.start && currentTime < nextChapterStart) {
                    const progressInChapter = currentTime - chapter.start;
                    chapterProgress = (progressInChapter / chapterDuration) * 100;
                  } else if (currentTime >= nextChapterStart) {
                    chapterProgress = 100;
                  }

                  return (
                    <div
                      key={index}
                      className={styles.chapterContainer}
                      style={{ width: `${chapterWidthPercent}%` }}
                    >
                      <Row
                        className={styles.chapterBar}
                        height="2"
                        radius="full"
                        background="neutral-strong"
                      >
                        <Row
                          className={styles.chapterProgress}
                          position="absolute"
                          height="4"
                          radius="full"
                          solid="brand-strong"
                          style={{ width: `${chapterProgress}%` }}
                        />
                      </Row>
                      <Row
                        className={styles.chapterOverlay}
                        zIndex={1}
                        background="page"
                        position="absolute"
                        paddingX="8"
                        paddingY="4"
                        onBackground="neutral-weak"
                        textVariant="label-default-xs"
                        vertical="center"
                        gap="8"
                        radius="s"
                        border
                        style={{ minWidth: "auto", width: "auto" }}
                        maxWidth={14}
                      >
                        <IconButton
                          data-scaling="90"
                          icon="play"
                          variant="ghost"
                          size="s"
                          onClick={() => seekToChapter(chapter.start)}
                        />
                        <Text wrap="nowrap" truncate>
                          {formatTime(chapter.start)}{" "}
                          <Text onBackground="neutral-strong">{chapter.title}</Text>
                        </Text>
                      </Row>
                    </div>
                  );
                })}
              </Row>
              <Row
                marginTop="12"
                textVariant="code-default-xs"
                onBackground="neutral-weak"
                fillWidth
                horizontal="between"
              >
                <Text>{formatTime(currentTime)}</Text>
                <Text>{formatTime(duration)}</Text>
              </Row>
            </>
          )}
        </Column>
      </Row>
    </>
  );
};
