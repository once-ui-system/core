/**
 * The WebGL counterpart of `canvasStage.ts`: one full-screen fragment shader
 * on a canvas sized to its container, redrawn with a running clock.
 *
 * Meant as the shared setup for the shader effects (GradientFx first; the
 * mascot's WebGL mediums and any later field effect can sit on it), so each
 * effect writes only its fragment shader and its uniforms.
 *
 * - The canvas runs at `maxDpr` device pixels per CSS pixel (default 1: soft
 *   fields do not need retina pixels, and a quarter of the pixels is a
 *   quarter of the work) and never above `maxPixels` in total.
 * - The loop is capped at `fps` (default 30) and sleeps while the container
 *   is off screen, while the tab is hidden (requestAnimationFrame does that),
 *   and after `stop()`. The clock only advances while the loop runs, so a
 *   field picks up where it left off.
 * - `paint()` draws one frame without starting the loop: the still frame
 *   under reduced motion.
 * - A lost context stops the loop and calls `onLost`, so the effect can show
 *   its CSS fallback.
 */
export interface ShaderStage {
  readonly gl: WebGLRenderingContext;
  /** Drawing-buffer pixels. */
  width: number;
  height: number;
  /** Looks up a uniform of the program (cached). */
  uniform: (name: string) => WebGLUniformLocation | null;
}

export interface ShaderStageOptions {
  fragment: string;
  /** Sets the uniforms for one frame; `time` is the running clock in seconds. */
  frame: (stage: ShaderStage, time: number) => void;
  /** Called after the first frame reaches the screen. */
  onReady?: () => void;
  /** Called when the browser takes the WebGL context away. */
  onLost?: () => void;
  maxDpr?: number;
  maxPixels?: number;
  fps?: number;
  /** Where the clock starts, in seconds. */
  startTime?: number;
}

export interface ShaderStageHandle {
  readonly stage: ShaderStage;
  /** Starts (or resumes) the loop. */
  play: () => void;
  /** Stops the loop and keeps the last frame. */
  pause: () => void;
  /** Draws one frame now at the current clock. */
  paint: () => void;
  /** Multiplies how fast the clock runs. */
  setRate: (rate: number) => void;
  stop: () => void;
}

const VERTEX = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // The effect falls back to its CSS look; nothing for the visitor to see.
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Whether this browser can give a canvas a WebGL context at all. */
export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl") ?? probe.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function createShaderStage(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  {
    fragment,
    frame,
    onReady,
    onLost,
    maxDpr = 1,
    maxPixels = 2_400_000,
    fps = 30,
    startTime = 0,
  }: ShaderStageOptions,
): ShaderStageHandle | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
  } catch {
    gl = null;
  }
  if (!gl || typeof gl.createProgram !== "function") return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook
  gl.useProgram(program);

  // One triangle that covers the whole viewport.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const cache = new Map<string, WebGLUniformLocation | null>();
  const stage: ShaderStage = {
    gl,
    width: 0,
    height: 0,
    uniform: (name) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    },
  };

  let raf: number | undefined;
  let last: number | undefined;
  let lastDrawn = -Infinity;
  let clock = startTime;
  let rate = 1;
  let playing = false;
  let visible = true;
  let stopped = false;
  let ready = false;
  const minInterval = 1000 / Math.max(1, fps);

  const measure = () => {
    const rect = container.getBoundingClientRect();
    let scale = Math.min(maxDpr, Math.max(0.5, window.devicePixelRatio || 1));
    const area = rect.width * rect.height * scale * scale;
    if (area > maxPixels) scale *= Math.sqrt(maxPixels / area);
    const width = Math.max(1, Math.round(rect.width * scale));
    const height = Math.max(1, Math.round(rect.height * scale));
    if (width === stage.width && height === stage.height) return false;
    stage.width = width;
    stage.height = height;
    canvas.width = width;
    canvas.height = height;
    return true;
  };

  const draw = () => {
    if (stopped || gl.isContextLost()) return;
    gl.viewport(0, 0, stage.width, stage.height);
    frame(stage, clock);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!ready) {
      ready = true;
      onReady?.();
    }
  };

  const tick = (now: number) => {
    raf = undefined;
    if (stopped || !visible || !playing) return;
    raf = requestAnimationFrame(tick);
    // A few ms of slack, so a 60 Hz screen's frames land on every second one.
    if (now - lastDrawn < minInterval - 4) return;
    lastDrawn = now;
    const dt = last === undefined ? 0 : Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    clock += dt * rate;
    draw();
  };

  const wake = () => {
    if (stopped || !visible || !playing || raf !== undefined) return;
    last = undefined;
    raf = requestAnimationFrame(tick);
  };

  const sleep = () => {
    if (raf !== undefined) cancelAnimationFrame(raf);
    raf = undefined;
    last = undefined;
  };

  measure();

  const remeasure = () => {
    // A new size clears the buffer; with the loop asleep, draw the still again.
    if (measure() && raf === undefined) draw();
  };
  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(container);
  } else {
    window.addEventListener("resize", remeasure);
  }

  let intersection: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    intersection = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      visible = entry.isIntersecting;
      if (visible) wake();
      else sleep();
    });
    intersection.observe(container);
  }

  const onContextLost = (event: Event) => {
    event.preventDefault();
    sleep();
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const stop = () => {
    stopped = true;
    sleep();
    resizeObserver?.disconnect();
    intersection?.disconnect();
    window.removeEventListener("resize", remeasure);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buffer);
  };

  return {
    stage,
    play: () => {
      playing = true;
      wake();
    },
    pause: () => {
      playing = false;
      sleep();
    },
    paint: draw,
    setRate: (next) => {
      rate = Number.isFinite(next) && next > 0 ? next : 1;
    },
    stop,
  };
}

/**
 * A colour the canvas can paint (see `canvasColor`) as linear-free sRGB
 * numbers in 0..1, read through a 1×1 2D canvas so every CSS colour syntax
 * works. `null` when the browser cannot read it back.
 */
export function rgbOf(color: string): [number, number, number] | null {
  if (typeof document === "undefined") return null;
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx || typeof ctx.getImageData !== "function") return null;
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1)?.data;
  if (!data) return null;
  return [data[0] / 255, data[1] / 255, data[2] / 255];
}
