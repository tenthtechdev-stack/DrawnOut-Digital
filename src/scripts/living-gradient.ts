/** A single low-resolution shader pass; decorative and independent of the GSAP runtime. */
type Connection = EventTarget & { saveData?: boolean };
type GradientSnapshot = {
  renderer: string;
  active: boolean;
  frames: number;
  time: number;
  width: number;
  height: number;
  pointer: { x: number; y: number };
  target: { x: number; y: number };
};

const vertexSource = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Three moving colour fields bend each other's edges. No textures, framebuffer
// feedback, noise loops, lighting passes or per-frame CPU geometry are needed.
const fragmentSource = `
  precision mediump float;
  varying vec2 uv;
  uniform float time;
  uniform float portrait;
  uniform vec2 pointer;

  float field(vec2 p, vec2 centre, vec2 size) {
    vec2 delta = (p - centre) / size;
    return exp(-dot(delta, delta) * 2.2);
  }

  void main() {
    vec2 p = vec2(uv.x, 1.0 - uv.y);
    float t = time * 0.26;
    vec2 flow = vec2(
      sin(p.y * 5.2 + t) * 0.11 + sin(p.x * 4.1 - t * 0.8) * 0.055,
      cos(p.x * 4.7 - t * 0.7) * 0.09 + sin(p.y * 6.0 + t * 0.9) * 0.045
    );
    vec2 q = p + flow + pointer * vec2(0.055, 0.035);
    vec2 orangeCentre = vec2(0.86 + sin(t * 0.84) * 0.2, 0.66 + cos(t) * 0.18);
    vec2 amberCentre = vec2(0.76 + cos(t * 0.75 + 2.0) * 0.23, 0.9 + sin(t * 0.9) * 0.19);
    vec2 lilacCentre = vec2(0.49 + sin(t * 0.65 + 3.0) * 0.17, 0.96 + cos(t * 0.85) * 0.12);
    float orange = field(q, orangeCentre, vec2(0.62, 0.63));
    float amber = field(q, amberCentre, vec2(0.64, 0.52));
    float lilac = field(q, lilacCentre, vec2(0.60, 0.37));
    vec3 paper = vec3(0.9686, 0.9608, 0.9451);
    vec3 colour = paper;
    colour = mix(colour, vec3(1.0, 0.72, 0.43), amber * 0.83);
    colour = mix(colour, vec3(1.0, 0.43, 0.22), orange * 0.89);
    colour = mix(colour, vec3(0.72, 0.67, 0.86), lilac * 0.65);
    // Keep the approved dark orange headline on a light surface at every phase.
    // Portrait framing needs the light area across the full width of the heading.
    float lightLeft = (1.0 - smoothstep(0.50, 0.88, p.x)) * (1.0 - smoothstep(0.58, 0.87, p.y));
    float lightTop = 1.0 - smoothstep(0.24, 0.62, p.y);
    float readability = max(lightLeft, lightTop * portrait);
    colour = mix(colour, paper, readability * 0.91);
    colour = mix(colour, paper, (1.0 - smoothstep(0.0, 0.18, p.y)) * 0.85);
    gl_FragColor = vec4(colour, 1.0);
  }
`;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const connection = (navigator as Navigator & { connection?: Connection }).connection;
const lifecycle = new AbortController();
let dispose: (() => void) | undefined;
let activeElement: HTMLElement | undefined;
let snapshot: (() => GradientSnapshot) | undefined;

if (import.meta.env.DEV) {
  Object.defineProperty(window, '__drawnoutGradient', {
    configurable: true,
    get: () => snapshot?.(),
  });
}

function initialize(force = false) {
  const element = document.querySelector<HTMLElement>('[data-living-gradient]');
  if (!force && element && element === activeElement) return;
  dispose?.();
  dispose = undefined;
  activeElement = element ?? undefined;
  snapshot = undefined;
  if (!element) return;
  const canvas = element.querySelector<HTMLCanvasElement>('[data-gradient-canvas]');
  const hero = element.closest<HTMLElement>('[data-hero]');
  if (!canvas || !hero) return;

  element.dataset.gradientRenderer = 'static';
  element.dataset.gradientActive = 'false';
  if (
    reduced.matches ||
    connection?.saveData ||
    !('IntersectionObserver' in window) ||
    !('ResizeObserver' in window)
  )
    return;
  const abort = new AbortController();
  const { signal } = abort;
  let visible =
    hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight;
  let active = false;
  let animationFrame = 0;
  let graphicsFrame = 0;
  let graphicsStarted = false;
  let previous = 0;
  let time = 0;
  let frames = 0;
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let shaders: WebGLShader[] = [];
  let draw: (() => void) | undefined;
  let disposed = false;
  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  snapshot = () => ({
    renderer: element.dataset.gradientRenderer ?? 'static',
    active,
    frames,
    time,
    width: canvas.width,
    height: canvas.height,
    pointer: { ...pointer },
    target: { ...target },
  });

  function releaseGraphics() {
    if (gl && !gl.isContextLost()) {
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
    }
    program = null;
    buffer = null;
    shaders = [];
    draw = undefined;
  }

  function fallback() {
    releaseGraphics();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    element!.dataset.gradientRenderer = 'css';
  }

  function resize() {
    const bounds = element!.getBoundingClientRect();
    // Smooth fields need very few pixels. <=720px wide, <=800px high and DPR<=1.
    const scale = Math.min(
      window.devicePixelRatio || 1,
      1,
      720 / bounds.width,
      800 / bounds.height,
    );
    canvas!.width = Math.max(1, Math.round(bounds.width * scale));
    canvas!.height = Math.max(1, Math.round(bounds.height * scale));
    gl?.viewport(0, 0, canvas!.width, canvas!.height);
    if (active) draw?.();
  }

  function tick(now: number) {
    if (!active || !draw || disposed) return;
    // Cap at 30fps, and resume at the current pose rather than fast-forwarding.
    if (!previous || now - previous >= 1000 / 30 - 1) {
      const elapsed = previous ? Math.min(now - previous, 70) : 0;
      previous = now;
      time += elapsed / 1000;
      const ease = 1 - Math.exp(-elapsed / 260);
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;
      try {
        draw();
        frames += 1;
      } catch {
        fallback();
        return;
      }
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function updateActivity() {
    active = !disposed && visible && !document.hidden && !reduced.matches && !connection?.saveData;
    element!.dataset.gradientActive = String(active);
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previous = 0;
    if (active && draw) animationFrame = requestAnimationFrame(tick);
    if (active && !graphicsStarted) scheduleGraphics();
  }

  // Keep the CSS field available while the opening or headline is on screen.
  // Creating a WebGL context may synchronously initialize a GPU process; it must
  // never consume the hero's pre-paint deadline or stall the signature opening.
  function prepareGraphics() {
    graphicsFrame = 0;
    if (disposed || graphicsStarted || !active) return;
    graphicsStarted = true;
    try {
      gl = canvas!.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true,
      });
      if (gl) {
        const compile = (type: number, source: string) => {
          const shader = gl!.createShader(type);
          if (!shader) throw new Error('Gradient shader unavailable');
          shaders.push(shader);
          gl!.shaderSource(shader, source);
          gl!.compileShader(shader);
          if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
            throw new Error('Gradient shader unsupported');
          return shader;
        };
        program = gl.createProgram();
        if (!program) throw new Error('Gradient program unavailable');
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw new Error('Gradient program unsupported');
        gl.useProgram(program);
        buffer = gl.createBuffer();
        if (!buffer) throw new Error('Gradient buffer unavailable');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        const uniforms = {
          time: gl.getUniformLocation(program, 'time'),
          portrait: gl.getUniformLocation(program, 'portrait'),
          pointer: gl.getUniformLocation(program, 'pointer'),
        };
        draw = () => {
          gl!.uniform1f(uniforms.time, time);
          gl!.uniform1f(uniforms.portrait, canvas!.width < canvas!.height ? 1 : 0);
          gl!.uniform2f(uniforms.pointer, pointer.x, pointer.y);
          gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        };
        resize();
        draw();
        element!.dataset.gradientRenderer = 'webgl';
      }
    } catch {
      fallback();
    }
    updateActivity();
  }

  const entrance = new MutationObserver(scheduleGraphics);
  function scheduleGraphics() {
    if (disposed || graphicsStarted || graphicsFrame || !active) return;
    const state = document.documentElement.dataset;
    if (
      state.signatureIntro === 'pending' ||
      state.signatureIntro === 'playing' ||
      state.heroBoot === 'pending' ||
      state.heroEntrance === 'running'
    )
      return;
    entrance.disconnect();
    // Give the released semantic page a painted frame before GPU initialization.
    graphicsFrame = requestAnimationFrame(() => {
      graphicsFrame = requestAnimationFrame(prepareGraphics);
    });
  }
  element.dataset.gradientRenderer = 'css';
  entrance.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-signature-intro', 'data-hero-boot', 'data-hero-entrance'],
  });
  window.addEventListener('signature:intro-end', scheduleGraphics, { signal });
  scheduleGraphics();

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    updateActivity();
  });
  intersection.observe(hero);
  const dimensions = new ResizeObserver(resize);
  dimensions.observe(element);
  hero.addEventListener(
    'pointermove',
    (event) => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    },
    { passive: true, signal },
  );
  const resetPointer = () => {
    target.x = 0;
    target.y = 0;
  };
  hero.addEventListener('pointerleave', resetPointer, { passive: true, signal });
  finePointer.addEventListener('change', resetPointer, { signal });
  document.addEventListener('visibilitychange', updateActivity, { signal });
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      fallback();
      updateActivity();
    },
    { signal },
  );
  canvas.addEventListener('webglcontextrestored', () => initialize(true), { signal });
  updateActivity();

  dispose = () => {
    disposed = true;
    abort.abort();
    intersection.disconnect();
    dimensions.disconnect();
    entrance.disconnect();
    if (graphicsFrame) cancelAnimationFrame(graphicsFrame);
    if (animationFrame) cancelAnimationFrame(animationFrame);
    releaseGraphics();
    element.dataset.gradientRenderer = 'static';
    element.dataset.gradientActive = 'false';
  };
}

const restart = () => initialize(true);
reduced.addEventListener('change', restart, { signal: lifecycle.signal });
connection?.addEventListener('change', restart, { signal: lifecycle.signal });
document.addEventListener('astro:page-load', () => initialize(), { signal: lifecycle.signal });
document.addEventListener(
  'astro:before-swap',
  () => {
    dispose?.();
    activeElement = undefined;
  },
  { signal: lifecycle.signal },
);
window.addEventListener(
  'pagehide',
  () => {
    dispose?.();
    activeElement = undefined;
  },
  { signal: lifecycle.signal },
);
window.addEventListener(
  'pageshow',
  (event) => {
    if (event.persisted) restart();
  },
  { signal: lifecycle.signal },
);
initialize();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    dispose?.();
    lifecycle.abort();
  });
}
