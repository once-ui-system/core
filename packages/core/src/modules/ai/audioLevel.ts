"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Where a voice animation reads its loudness from: a microphone stream, an
 * `<audio>`/`<video>` element playing the reply, or an `AnalyserNode` an app
 * already has (for example from a realtime voice SDK).
 */
export type AudioLevelSource = MediaStream | HTMLMediaElement | AnalyserNode;

export interface AudioMeter {
  /** Loudness from 0 to 1, smoothed: quick to rise, slower to fall. */
  level: () => number;
  /** Fills `out` with `out.length` frequency bands, each 0 to 1, low to high. */
  bands: (out: Float32Array) => void;
  disconnect: () => void;
}

/* A media element can be wired into Web Audio only once in its life, so its
   source node is kept and reused across mounts. */
const elementSources = new WeakMap<
  HTMLMediaElement,
  { context: AudioContext; node: MediaElementAudioSourceNode }
>();
let sharedContext: AudioContext | undefined;

const audioContext = (): AudioContext | undefined => {
  if (typeof window === "undefined") return undefined;
  const Context =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return undefined;
  sharedContext ??= new Context();
  return sharedContext;
};

const isAnalyser = (source: AudioLevelSource): source is AnalyserNode =>
  typeof AnalyserNode !== "undefined" && source instanceof AnalyserNode;

const isElement = (source: AudioLevelSource): source is HTMLMediaElement =>
  typeof HTMLMediaElement !== "undefined" && source instanceof HTMLMediaElement;

/**
 * Connects an analyser to `source` and returns readers for its loudness and
 * frequency bands. Returns `undefined` where Web Audio is missing (server,
 * tests, old browsers), so callers fall back to their idle animation.
 */
export function createAudioMeter(source: AudioLevelSource): AudioMeter | undefined {
  let analyser: AnalyserNode;
  let cleanup = () => {};

  if (isAnalyser(source)) {
    analyser = source;
  } else {
    const context = isElement(source)
      ? (elementSources.get(source)?.context ?? audioContext())
      : audioContext();
    if (!context) return undefined;
    analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    if (isElement(source)) {
      let entry = elementSources.get(source);
      if (!entry) {
        const node = context.createMediaElementSource(source);
        // Rerouted through Web Audio, the element is silent unless it still
        // reaches the speakers.
        node.connect(context.destination);
        entry = { context, node };
        elementSources.set(source, entry);
      }
      entry.node.connect(analyser);
      cleanup = () => entry?.node.disconnect(analyser);
    } else {
      const node = context.createMediaStreamSource(source);
      // A microphone goes to the analyser only, never the speakers.
      node.connect(analyser);
      cleanup = () => node.disconnect();
    }
    if (context.state === "suspended") context.resume().catch(() => {});
  }

  const wave = new Uint8Array(analyser.fftSize);
  const spectrum = new Uint8Array(analyser.frequencyBinCount);
  let smoothed = 0;

  return {
    level: () => {
      analyser.getByteTimeDomainData(wave);
      let sum = 0;
      for (const sample of wave) {
        const centered = (sample - 128) / 128;
        sum += centered * centered;
      }
      // Speech RMS rarely passes ~0.35, so it is scaled up to use the range.
      const rms = Math.min(1, Math.sqrt(sum / wave.length) * 2.8);
      smoothed = rms > smoothed ? smoothed + (rms - smoothed) * 0.6 : smoothed * 0.85 + rms * 0.15;
      return smoothed;
    },
    bands: (out) => {
      analyser.getByteFrequencyData(spectrum);
      // Voice sits in the lower part of the spectrum; the top third is mostly
      // empty, so the bands cover the first two thirds.
      const usable = Math.floor(spectrum.length * 0.66);
      const per = Math.max(1, Math.floor(usable / out.length));
      for (let band = 0; band < out.length; band++) {
        let peak = 0;
        for (let i = band * per; i < (band + 1) * per && i < usable; i++) {
          peak = Math.max(peak, spectrum[i]);
        }
        out[band] = peak / 255;
      }
    },
    disconnect: cleanup,
  };
}

/**
 * The loudness of `source` from 0 to 1, updated every animation frame while
 * there is a source. Use it to drive your own visuals, such as a `Mascot`'s
 * mouth; `VoiceVisualizer` reads its source without re-rendering.
 */
export function useAudioLevel(source: AudioLevelSource | null | undefined): number {
  const [level, setLevel] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    if (!source) {
      setLevel(0);
      return;
    }
    const meter = createAudioMeter(source);
    if (!meter) return;
    let frame = 0;
    const tick = () => {
      const next = meter.level();
      // Skip renders for changes nobody could see.
      if (Math.abs(next - last.current) > 0.01) {
        last.current = next;
        setLevel(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      meter.disconnect();
    };
  }, [source]);

  return level;
}
