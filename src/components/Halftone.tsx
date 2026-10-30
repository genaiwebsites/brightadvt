import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a;
varying vec2 vUv;
void main() {
  vUv = a * 0.5 + 0.5;
  gl_Position = vec4(a, 0.0, 1.0);
}`;

// Print-style halftone: the image is sampled once per cell of a 45° screen and
// drawn as an ink dot sized by how dark that cell is. As progress runs, the
// screen gets finer and the dots swell until they resolve into the photograph.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tex;
uniform vec2 res;
uniform float p;
uniform float dpr;
uniform vec3 paper;

const float A = 0.785398;
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  float e = 1.0 - pow(1.0 - p, 3.0);
  float cs = mix(22.0, 2.5, e) * dpr;
  vec2 px = vUv * res;
  vec2 rp = rot(A) * px;
  vec2 center = (floor(rp / cs) + 0.5) * cs;
  vec2 cuv = clamp((rot(-A) * center) / res, 0.0, 1.0);
  vec3 c = texture2D(tex, cuv).rgb;
  float ink = 1.0 - dot(c, vec3(0.299, 0.587, 0.114));
  float grow = smoothstep(0.0, 0.55, p);
  float radius = mix(0.32, 1.42, ink) * grow;
  float d = length(rp - center) / (cs * 0.5);
  float aa = 2.0 / (cs * 0.5);
  float m = 1.0 - smoothstep(radius - aa, radius + aa, d);
  vec3 ht = mix(paper, c, m);
  vec3 full = texture2D(tex, vUv).rgb;
  gl_FragColor = vec4(mix(ht, full, smoothstep(0.62, 1.0, p)), 1.0);
}`;

const PAPER = [0xe9 / 255, 0xe5 / 255, 0xdc / 255];
const DURATION = 1900;

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
};

/**
 * An <img> that resolves out of a halftone screen the first time it scrolls
 * into view. The image itself is always in the DOM; the WebGL canvas only
 * overlays it during the reveal and is then discarded.
 */
export function Halftone({ src, alt, width, height, className = "", imgClassName = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const host = wrap.current;
    const image = img.current;
    if (!host || !image) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let raf = 0;
    let io: IntersectionObserver | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let gl: WebGLRenderingContext | null = null;

    const cleanup = () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      canvas?.remove();
      image.style.opacity = "";
    };

    const setup = () => {
      if (cancelled) return;
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "pointer-events-none absolute inset-0 size-full";
      gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
      if (!gl) return;

      const sh = (type: number, code: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, code);
        gl!.compileShader(s);
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      } catch {
        return;
      }

      const u = (n: string) => gl!.getUniformLocation(prog, n);
      const uRes = u("res");
      const uP = u("p");
      const uDpr = u("dpr");
      gl.uniform3fv(u("paper"), PAPER);

      const dpr = Math.min(devicePixelRatio || 1, 2);
      const size = () => {
        const b = host.getBoundingClientRect();
        canvas!.width = Math.max(1, Math.round(b.width * dpr));
        canvas!.height = Math.max(1, Math.round(b.height * dpr));
        gl!.viewport(0, 0, canvas!.width, canvas!.height);
        gl!.uniform2f(uRes, canvas!.width, canvas!.height);
        gl!.uniform1f(uDpr, dpr);
      };
      const draw = (p: number) => {
        gl!.uniform1f(uP, p);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      };

      size();
      draw(0);
      host.appendChild(canvas);
      image.style.opacity = "0";

      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io?.disconnect();
          size();
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / DURATION);
            draw(p);
            if (p < 1) raf = requestAnimationFrame(tick);
            else cleanup();
          };
          raf = requestAnimationFrame(tick);
        },
        { threshold: 0.3 }
      );
      io.observe(host);
    };

    if (image.complete && image.naturalWidth) setup();
    else image.addEventListener("load", setup, { once: true });

    return () => {
      cancelled = true;
      image.removeEventListener("load", setup);
      cleanup();
    };
  }, [src]);

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-paper-2 ${className}`}>
      <img
        ref={img}
        src={src}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        loading="lazy"
        className={`block ${imgClassName || "h-auto w-full"}`}
      />
    </div>
  );
}
