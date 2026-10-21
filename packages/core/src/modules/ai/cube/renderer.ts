/* A tiny WebGL 1 renderer: one shader, lit, unlit or a soft round glow. Enough for the cube
   mascot and nothing more, so core stays free of a 3D dependency. */

import type { MeshData } from "./geometry.js";
import { type Mat4, normalMatrix } from "./math.js";

export type RGB = [number, number, number];

export interface Material {
  color: RGB;
  /** `lit` takes the scene's light, `unlit` is one flat color, `glow` is a soft round spot. */
  mode: "lit" | "unlit" | "glow";
  opacity?: number;
  /** 0 is matte, 1 is glossy with a clear coat. */
  gloss?: number;
}

export interface GpuMesh {
  count: number;
  groups?: { start: number; count: number }[];
  update(data: MeshData, indices?: boolean): void;
  position: WebGLBuffer;
  normal: WebGLBuffer;
  index: WebGLBuffer;
}

const VERTEX = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform mat3 uNormalMatrix;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vLocal;
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorld = world.xyz;
  vNormal = uNormalMatrix * aNormal;
  vLocal = aPosition.xy;
  gl_Position = uViewProjection * world;
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uMode;
uniform float uGloss;
uniform vec3 uEye;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vLocal;
vec3 light(vec3 n, vec3 v, vec3 dir, vec3 color, float strength, float specular) {
  float d = max(dot(n, dir), 0.0);
  vec3 h = normalize(dir + v);
  float s = pow(max(dot(n, h), 0.0), mix(12.0, 70.0, uGloss)) * specular * (0.15 + uGloss);
  float coat = pow(max(dot(n, h), 0.0), 220.0) * uGloss * specular * 0.9;
  return uColor * color * strength * d + vec3(s + coat) * strength;
}
void main() {
  if (uMode > 1.5) {
    float a = 1.0 - smoothstep(0.0, 0.5, length(vLocal));
    gl_FragColor = vec4(uColor, a * uOpacity);
    return;
  }
  if (uMode > 0.5) {
    gl_FragColor = vec4(uColor, uOpacity);
    return;
  }
  vec3 n = normalize(vNormal);
  vec3 v = normalize(uEye - vWorld);
  if (dot(n, v) < 0.0) n = -n;
  vec3 sky = vec3(0.87, 0.9, 1.0);
  vec3 ground = vec3(0.1, 0.11, 0.13);
  vec3 c = uColor * mix(ground, sky, 0.5 * n.y + 0.5) * 0.75;
  c += light(n, v, normalize(vec3(3.0, 5.0, 6.0)), vec3(1.0), 0.85, 1.0);
  c += light(n, v, normalize(vec3(-5.0, 2.0, -4.0)), vec3(0.62, 0.69, 1.0), 0.45, 0.4);
  c += light(n, v, normalize(vec3(-3.0, -2.0, 5.0)), vec3(1.0), 0.25, 0.5);
  gl_FragColor = vec4(c, uOpacity);
}`;

const MODE = { lit: 0, unlit: 1, glow: 2 } as const;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "WebGL shader");
  }
  return shader;
}

export class Renderer {
  readonly gl: WebGLRenderingContext;
  private attribs: { position: number; normal: number };
  private uniforms: Record<string, WebGLUniformLocation | null>;
  private normal = new Float32Array(9);

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) throw new Error("WebGL is not available");
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error("WebGL program");
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("WebGL link");
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook
    gl.useProgram(program);
    this.attribs = {
      position: gl.getAttribLocation(program, "aPosition"),
      normal: gl.getAttribLocation(program, "aNormal"),
    };
    this.uniforms = Object.fromEntries(
      [
        "uModel",
        "uViewProjection",
        "uNormalMatrix",
        "uColor",
        "uOpacity",
        "uMode",
        "uGloss",
        "uEye",
      ].map((name) => [name, gl.getUniformLocation(program, name)]),
    );
    gl.enableVertexAttribArray(this.attribs.position);
    gl.enableVertexAttribArray(this.attribs.normal);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // Color blends as usual; alpha adds up, so a glow over the body never punches through the canvas.
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  mesh(data: MeshData, dynamic = false): GpuMesh {
    const gl = this.gl;
    const usage = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
    const make = () => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("WebGL buffer");
      return buffer;
    };
    const mesh: GpuMesh = {
      count: data.indices.length,
      groups: data.groups,
      position: make(),
      normal: make(),
      index: make(),
      update(next, indices = false) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position);
        gl.bufferData(gl.ARRAY_BUFFER, next.positions, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal);
        gl.bufferData(gl.ARRAY_BUFFER, next.normals, usage);
        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, next.indices, gl.STATIC_DRAW);
          mesh.count = next.indices.length;
        }
      },
    };
    mesh.update(data, true);
    return mesh;
  }

  begin(width: number, height: number, viewProjection: Mat4, eye: [number, number, number]) {
    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.uniforms.uViewProjection, false, viewProjection);
    gl.uniform3fv(this.uniforms.uEye, eye);
  }

  draw(
    mesh: GpuMesh,
    model: Mat4,
    material: Material,
    range?: { start: number; count: number },
    depthWrite = true,
  ) {
    const gl = this.gl;
    gl.depthMask(depthWrite);
    gl.uniformMatrix4fv(this.uniforms.uModel, false, model);
    gl.uniformMatrix3fv(this.uniforms.uNormalMatrix, false, normalMatrix(model, this.normal));
    gl.uniform3fv(this.uniforms.uColor, material.color);
    gl.uniform1f(this.uniforms.uOpacity, material.opacity ?? 1);
    gl.uniform1f(this.uniforms.uMode, MODE[material.mode]);
    gl.uniform1f(this.uniforms.uGloss, material.gloss ?? 0.6);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position);
    gl.vertexAttribPointer(this.attribs.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal);
    gl.vertexAttribPointer(this.attribs.normal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index);
    const start = range?.start ?? 0;
    gl.drawElements(gl.TRIANGLES, range?.count ?? mesh.count, gl.UNSIGNED_SHORT, start * 2);
  }

  dispose() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
