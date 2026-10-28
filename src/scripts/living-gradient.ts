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

// Two nested, low-frequency domain warps produce broad liquid contours rather
// than translating soft circles. This is one analytic shader pass: no textures,
// simulation buffers, noise loops, or per-frame CPU geometry.
const fragmentSource = `
  precision mediump float;
  varying vec2 uv;
  uniform float time;
  uniform vec2 pointer;

  vec2 bend(vec2 p, float t) {
    return vec2(
      sin(p.y * 3.6 + sin(p.x * 2.1 - t * 0.48) + t * 0.62),
      cos(p.x * 3.1 - cos(p.y * 2.7 + t * 0.42) - t * 0.53)
    );
  }

  void main() {
    vec2 p = vec2(uv.x, 1.0 - uv.y);
    float t = time * 0.68;
    vec2 q = p + bend(p, t) * 0.27;
    q += bend(q * 1.34 + vec2(2.7, 1.3), t * 0.81) * 0.17;

    // The eased cursor gently bends only the nearby flow; autonomous movement
    // continues at rest. Returning the pointer to zero restores its idle shape.
    vec2 delta = p - (pointer * 0.5 + 0.5);
    float influence = exp(-dot(delta, delta) * 13.0) * length(pointer);
    q += vec2(-delta.y, delta.x) * influence * 0.34;
    q += pointer * influence * 0.075;

    float ribbon = 0.5 + 0.5 * sin(q.x * 4.1 + q.y * 2.2
      + sin(q.y * 4.5 - t * 0.46) * 0.72 - t * 0.57);
    float warm = smoothstep(0.12, 0.82, ribbon);
    float coral = smoothstep(0.48, 0.96, ribbon);
    float cool = smoothstep(0.48, 0.92,
      0.5 + 0.5 * sin(q.y * 3.7 - q.x * 2.4 + t * 0.51));
    float cream = smoothstep(0.68, 0.98,
      0.5 + 0.5 * sin(q.x * 2.8 - q.y * 4.0 + t * 0.44));

    vec3 paper = vec3(0.9686, 0.9608, 0.9451);
    vec3 colour = mix(paper, vec3(1.0, 0.69, 0.31), warm * 0.94);
    colour = mix(colour, vec3(0.98, 0.34, 0.16), coral * 0.82);
    colour = mix(colour, vec3(0.72, 0.67, 0.86), cool * (1.0 - warm) * 0.66);
    colour = mix(colour, vec3(1.0, 0.91, 0.76), cream * 0.44);
    // Only the edge joins the surrounding paper. Typography gets local DOM
    // scrims, so the rest of the canvas retains its colour and visible flow.
    float edge = 1.0 - smoothstep(0.0, 0.065, p.y);
    gl_FragColor = vec4(mix(colour, paper, edge * 0.55), 1.0);
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
    const intro = document.documentElement.dataset.signatureIntro;
    const coveredByIntro = intro === 'pending' || intro === 'playing';
    // The opaque loader covers the hero. Pause CSS as well as WebGL so its
    // blurred fallback layers do not compete with the approved storyboard.
    active =
      !disposed &&
      visible &&
      !coveredByIntro &&
      !document.hidden &&
      !reduced.matches &&
      !connection?.saveData;
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
          pointer: gl.getUniformLocation(program, 'pointer'),
        };
        draw = () => {
          gl!.uniform1f(uniforms.time, time);
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

  const entrance = new MutationObserver(updateActivity);
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
  window.addEventListener('signature:intro-end', updateActivity, { signal });
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
