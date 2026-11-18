/** Small deterministic SVG compositing vocabulary. All artwork is source pixels. */
export const duration = 7.5;
export const fps = 24;
export const frames = duration * fps;
export const formats = {
  landscape: { width: 1440, height: 810 },
  portrait: { width: 810, height: 1080 },
};
export const clamp = (value) => Math.min(1, Math.max(0, value));
export const smooth = (value) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};
export const ramp = (t, start, end) => smooth((t - start) / (end - start));
export const presence = (t, start, enterEnd, exitStart, end) =>
  ramp(t, start, enterEnd) * (1 - ramp(t, exitStart, end));
export const n = (value) => Number(value.toFixed(4));
export const image = (asset, x, y, width, height, options = {}) => {
  const { rotation = 0, opacity = 1, scale = 1 } = options;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g opacity="${n(opacity)}" transform="translate(${n(cx)} ${n(cy)}) rotate(${n(rotation)}) scale(${n(scale)})"><image href="${asset.uri}" x="${n(-width / 2)}" y="${n(-height / 2)}" width="${n(width)}" height="${n(height)}" preserveAspectRatio="xMidYMid meet"/></g>`;
};
export const rect = (x, y, width, height, fill, radius = 0, opacity = 1) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="${n(radius)}" fill="${fill}" opacity="${n(opacity)}"/>`;
export const circle = (x, y, radius, fill, opacity = 1) =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(radius)}" fill="${fill}" opacity="${n(opacity)}"/>`;
export const path = (d, { fill = 'none', stroke = 'none', strokeWidth = 1, opacity = 1 } = {}) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${n(opacity)}"/>`;
export const svg = { image, rect, circle, path, smooth, ramp, presence, n };
