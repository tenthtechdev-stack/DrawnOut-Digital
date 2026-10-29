/**
 * Six original motion compositions made from approved, unchanged source pixels.
 * Coordinates are source PNG pixel crops, not reconstructed official marks.
 * No scene uses an invented logo, product model, client fact or performance claim.
 */
export const duration = 5.75;
export const fps = 24;
export const frames = duration * fps;
export const formats = {
  landscape: { width: 960, height: 540 },
  portrait: { width: 600, height: 750 },
};

const original = (folder, number) =>
  `design-assets/portfolio-originals/${folder}/${folder}_${String(number).padStart(2, '0')}.png`;
const crop = (folder, number, bounds) => ({ source: original(folder, number), bounds });

export const projects = {
  'sol-community-center': {
    title: 'SOL Community Center',
    direction: 'Symbol becomes a system: concentric apertures, signage and stationery.',
    background: '#286332',
    assets: {
      identity: crop('02_SOL_Community_Center', 1, [1073, 279, 478, 244]),
      signage: crop('02_SOL_Community_Center', 4, [0, 0, 650, 397]),
      card: crop('02_SOL_Community_Center', 4, [0, 670, 475, 262]),
      notebook: crop('02_SOL_Community_Center', 4, [486, 670, 387, 262]),
      apparel: crop('02_SOL_Community_Center', 4, [1110, 0, 544, 397]),
    },
  },
  bunzo: {
    title: 'Bunzo',
    direction: 'Packaging with punch: red shutters and independently moving application panels.',
    background: '#c40c09',
    assets: {
      identity: crop('04_Bunzo', 1, [65, 22, 770, 478]),
      packaging: crop('04_Bunzo', 3, [0, 0, 1654, 539]),
      cup: crop('04_Bunzo', 4, [390, 8, 411, 505]),
      bag: crop('04_Bunzo', 4, [812, 8, 430, 505]),
      box: crop('04_Bunzo', 3, [3, 548, 382, 329]),
    },
  },
  triarch: {
    title: 'Triarch',
    direction: 'Architectural lines: measured construction guides, monogram and stationery.',
    background: '#e9e9e7',
    assets: {
      identity: crop('14_Triarch', 1, [44, 161, 744, 162]),
      monogram: crop('14_Triarch', 2, [132, 586, 161, 180]),
      card: crop('14_Triarch', 1, [838, 0, 816, 931]),
      device: crop('14_Triarch', 2, [1102, 301, 552, 630]),
    },
  },
  churros: {
    title: 'Churros Dessert Shop',
    direction: 'Illustrated sweetness: arcs, revolving circular windows and packaging.',
    background: '#f8ecd4',
    assets: {
      identity: crop('07_Churros_Dessert_Shop', 1, [118, 38, 689, 717]),
      bag: crop('07_Churros_Dessert_Shop', 3, [0, 18, 383, 419]),
      box: crop('07_Churros_Dessert_Shop', 3, [393, 18, 483, 419]),
      sign: crop('07_Churros_Dessert_Shop', 3, [1250, 18, 404, 419]),
      pattern: crop('07_Churros_Dessert_Shop', 2, [744, 582, 242, 261]),
    },
  },
  'by-tech-group': {
    title: 'By Tech Group',
    direction: 'Identity in modules: progressive grid apertures and assembled applications.',
    background: '#08090d',
    assets: {
      identity: crop('03_By_Tech_Group', 1, [468, 123, 725, 485]),
      building: crop('03_By_Tech_Group', 2, [0, 551, 551, 380]),
      flag: crop('03_By_Tech_Group', 2, [559, 551, 476, 380]),
      mug: crop('03_By_Tech_Group', 3, [1121, 0, 533, 437]),
      folio: crop('03_By_Tech_Group', 3, [386, 445, 802, 486]),
    },
  },
  'u-wanna-smoothie': {
    title: 'U Wanna Smoothie',
    direction: 'Liquid and flavor: elastic wave masks, illustrated menu and product imagery.',
    background: '#fbd6df',
    assets: {
      identity: crop('12_U_Wanna_Smoothie', 1, [565, 207, 522, 518]),
      cup: crop('12_U_Wanna_Smoothie', 1, [0, 0, 555, 931]),
      drink: crop('12_U_Wanna_Smoothie', 2, [882, 389, 522, 492]),
      menu: crop('12_U_Wanna_Smoothie', 3, [0, 404, 821, 459]),
    },
  },
};

const clamp = (n) => Math.max(0, Math.min(1, n));
const ease = (n) => {
  const p = clamp(n);
  return p * p * (3 - 2 * p);
};
const ramp = (t, start, end) => ease((t - start) / (end - start));
const presence = (t, start, enterEnd, exitStart, end) =>
  ramp(t, start, enterEnd) * (1 - ramp(t, exitStart, end));
const n = (value) => Number(value.toFixed(3));

/** Deterministic SVG: the first/last six frames are identical, not a dissolve seam. */
export function renderComposition(slug, format, seconds, assets) {
  const project = projects[slug];
  if (!project || !formats[format]) throw new Error('Unknown portfolio motion composition');
  const { width: w, height: h } = formats[format];
  const portrait = format === 'portrait';
  const t = seconds <= 0.25 || seconds >= 5.5 ? 0 : seconds;
  let nextId = 0;
  const defs = [];
  const clip = (shape) => {
    const id = `mask-${nextId++}`;
    defs.push(`<clipPath id="${id}">${shape}</clipPath>`);
    return `url(#${id})`;
  };
  const rect = (x, y, width, height, fill, radius = 0, opacity = 1) =>
    `<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, width))}" height="${n(Math.max(0, height))}" rx="${n(radius)}" fill="${fill}" opacity="${n(opacity)}"/>`;
  const circle = (x, y, radius, fill, opacity = 1) =>
    `<circle cx="${n(x)}" cy="${n(y)}" r="${n(Math.max(0, radius))}" fill="${fill}" opacity="${n(opacity)}"/>`;
  const line = (x1, y1, x2, y2, color, weight = 1, opacity = 1) =>
    `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}" stroke="${color}" stroke-width="${weight}" opacity="${n(opacity)}"/>`;
  const ring = (x, y, radius, color, weight = 1, opacity = 1) =>
    `<circle cx="${n(x)}" cy="${n(y)}" r="${n(Math.max(0, radius))}" fill="none" stroke="${color}" stroke-width="${weight}" opacity="${n(opacity)}"/>`;
  const image = (name, x, y, width, height, options = {}) => {
    const { cover = false, radius = 0, mask, angle = 0, opacity = 1 } = options;
    const bounds = clip(rect(x, y, width, height, '#fff', radius));
    return `<g opacity="${n(opacity)}" transform="rotate(${n(angle)} ${n(x + width / 2)} ${n(y + height / 2)})" clip-path="${bounds}"><g${mask ? ` clip-path="${mask}"` : ''}><image href="${assets[name]}" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" preserveAspectRatio="xMidYMid ${cover ? 'slice' : 'meet'}"/></g></g>`;
  };
  const application = presence(t, 1.15, 2.05, 4.1, 5.45);
  let body = rect(0, 0, w, h, project.background);

  if (slug === 'sol-community-center') {
    const logoWidth = portrait ? 470 : 478;
    body += image('identity', (w - logoWidth) / 2, h / 2 - 122, logoWidth, 244);
    const construction = presence(t, 0.25, 0.65, 1.2, 1.8);
    for (let i = 0; i < 3; i++) {
      const r = 75 + i * 40 + Math.sin(t * 1.7 + i) * 16;
      body += ring(w / 2, h / 2, r, i === 1 ? '#f6a817' : '#e8ead6', 2, construction * 0.55);
    }
    const aperture = clip(circle(w / 2, h / 2, Math.hypot(w, h) * 0.6 * application, '#fff'));
    body += `<g clip-path="${aperture}">${rect(0, 0, w, h, '#f3eee1')}`;
    const cardP = ramp(t, 1.65, 2.65);
    if (portrait) {
      body += image('signage', 30, 35, w - 60, 330, { cover: true, radius: 4 });
      body += image('card', 27 - (1 - cardP) * 130, 402, 285, 198, { cover: true, angle: -7 + cardP * 3 });
      body += image('notebook', 316 + (1 - cardP) * 170, 425, 257, 192, { cover: true, angle: 8 - cardP * 4 });
      body += ring(w / 2, 662, 29, '#f6a817', 7);
      body += ring(w / 2 + 13, 662, 29, '#286332', 3);
    } else {
      body += image('signage', 40, 48, 540, 330, { cover: true, radius: 3 });
      body += image('apparel', 620, 45 + (1 - cardP) * 200, 290, 212, { cover: true });
      body += image('card', 383 - (1 - cardP) * 130, 334, 270, 149, { cover: true, angle: -6 + cardP * 3 });
      body += image('notebook', 666 + (1 - cardP) * 140, 297, 250, 169, { cover: true, angle: 8 - cardP * 4 });
      body += ring(112, 444, 30, '#f6a817', 6);
      body += ring(127, 444, 30, '#286332', 3);
    }
    body += '</g>';
    body += ring(w / 2, h / 2, Math.hypot(w, h) * 0.6 * application, '#f6a817', 8, application > 0 && application < 1 ? 1 : 0);
  } else if (slug === 'bunzo') {
    const logoWidth = portrait ? 550 : 710;
    const logoHeight = logoWidth * 478 / 770;
    body += image('identity', (w - logoWidth) / 2, (h - logoHeight) / 2, logoWidth, logoHeight);
    const bars = 5;
    let shutters = '';
    for (let i = 0; i < bars; i++) {
      const amount = presence(t, 0.85 + i * 0.08, 1.6 + i * 0.08, 4.3 + i * 0.07, 5.4);
      shutters += rect((w / bars) * i, i % 2 ? h * (1 - amount) : 0, w / bars + 1, h * amount, '#fff');
    }
    const shutter = clip(shutters);
    body += `<g clip-path="${shutter}">${rect(0, 0, w, h, '#f2b825')}`;
    const punch = ramp(t, 1.7, 2.45);
    if (portrait) {
      body += image('packaging', 0, 29, w, 260, { cover: true });
      body += image('cup', 28, 336 + (1 - punch) * 180, 247, 303, { cover: true, angle: -7 + 3 * punch });
      body += image('bag', 307, 329 - (1 - punch) * 150, 253, 303, { cover: true, angle: 7 - 3 * punch });
    } else {
      body += image('packaging', 0, 0, w, 268, { cover: true });
      body += image('box', 40 - (1 - punch) * 200, 286, 290, 220, { cover: true, angle: -5 + 2 * punch });
      body += image('cup', 374, 278 + (1 - punch) * 180, 222, 235, { cover: true, angle: 5 - 2 * punch });
      body += image('bag', 661 + (1 - punch) * 200, 280, 259, 233, { cover: true, angle: -4 + 2 * punch });
    }
    body += '</g>';
    const accent = presence(t, 0.3, 0.6, 1.2, 1.6);
    body += line(24, h * 0.22, 24 + w * 0.13 * accent, h * 0.22, '#ffc107', 9);
    body += line(w - 24 - w * 0.13 * accent, h * 0.78, w - 24, h * 0.78, '#fff2d4', 9);
  } else if (slug === 'triarch') {
    const logoWidth = portrait ? 534 : 744;
    const top = portrait ? 294 : 212;
    body += image('identity', (w - logoWidth) / 2, top, logoWidth, logoWidth * 162 / 744);
    const guides = presence(t, 0.25, 0.85, 1.5, 2);
    for (let i = 0; i < 5; i++) {
      const x = w * (0.14 + i * 0.18);
      body += line(x, h * 0.12, x, h * (0.12 + 0.76 * ramp(t, 0.3 + i * 0.08, 1.1 + i * 0.08)), '#37383a', 1, guides);
    }
    body += line(w * 0.08, top - 22, w * 0.92, top - 22, '#37383a', 1, guides);
    body += line(w * 0.08, top + 165, w * 0.92, top + 165, '#e2ae25', 3, guides);
    const leftGate = clip(rect(0, h * (1 - application) / 2, w, h * application, '#fff'));
    body += `<g clip-path="${leftGate}">${rect(0, 0, w, h, '#d8d8d6')}`;
    const slide = ramp(t, 1.7, 2.9);
    if (portrait) {
      body += image('card', 38, 25 + (1 - slide) * 110, 322, 460, { cover: true, angle: -3 + slide * 2 });
      body += image('device', 309, 313 - (1 - slide) * 100, 250, 356, { cover: true, angle: 3 - slide });
      body += image('monogram', 67, 532, 108, 122);
    } else {
      body += image('card', 84 + (1 - slide) * 100, 36, 380, 468, { cover: true, angle: -3 + slide * 2 });
      body += image('device', 535 - (1 - slide) * 100, 46, 339, 446, { cover: true, angle: 3 - slide });
    }
    body += line(w * 0.04, h * 0.93, w * (0.04 + 0.92 * slide), h * 0.93, '#e2ae25', 3);
    body += '</g>';
  } else if (slug === 'churros') {
    const logoHeight = portrait ? 570 : 460;
    const logoWidth = logoHeight * 689 / 717;
    body += image('identity', (w - logoWidth) / 2, (h - logoHeight) / 2, logoWidth, logoHeight);
    const orbit = presence(t, 0.25, 0.9, 1.4, 1.85);
    const orbitAngle = -0.7 + t * 0.8;
    for (let i = 0; i < 3; i++) {
      const angle = orbitAngle + i * Math.PI * 2 / 3;
      body += circle(w / 2 + Math.cos(angle) * w * 0.39, h / 2 + Math.sin(angle) * h * 0.38, 9 + i * 4, ['#c94c1d', '#f4ad18', '#7d371b'][i], orbit);
    }
    const expansion = clip(circle(w * 0.5, h * 0.5, Math.hypot(w, h) * 0.65 * application, '#fff'));
    body += `<g clip-path="${expansion}">${rect(0, 0, w, h, '#f2b728')}`;
    body += image('pattern', 0, 0, w, h, { cover: true, opacity: 0.18 });
    const shift = Math.sin((t - 2) * 0.9) * 12;
    const windows = portrait
      ? [[w * 0.35, 210, 170, 'bag'], [w * 0.69, 455, 164, 'box'], [w * 0.27, 627, 102, 'sign']]
      : [[w * 0.23, 277, 176, 'bag'], [w * 0.57, 245, 181, 'box'], [w * 0.84, 365, 108, 'sign']];
    windows.forEach(([x, y, r, name], index) => {
      const yy = y + shift * (index % 2 ? -1 : 1);
      body += circle(x + 5, yy + 8, r + 5, '#a44d1e', 0.2);
      const opening = clip(circle(x, yy, r, '#fff'));
      body += image(name, x - r, yy - r, r * 2, r * 2, { cover: true, mask: opening });
      body += ring(x, yy, r + 4, '#f9efd8', 5);
    });
    body += '</g>';
  } else if (slug === 'by-tech-group') {
    const logoWidth = portrait ? 560 : 725;
    body += image('identity', (w - logoWidth) / 2, (h - logoWidth * 485 / 725) / 2, logoWidth, logoWidth * 485 / 725);
    const guides = presence(t, 0.25, 0.7, 1.3, 1.8);
    for (let i = 0; i < 4; i++) {
      body += rect(w * (0.08 + i * 0.22), h * 0.88, w * 0.15 * guides, 5, ['#6c5ce7', '#209cdb', '#8bc34a', '#209cdb'][i]);
    }
    let modules = '';
    const columns = portrait ? 3 : 4;
    const rows = 3;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const delay = (row + col) * 0.07;
        const p = presence(t, 1 + delay, 1.7 + delay, 4.2 + delay, 5.45);
        const cellW = w / columns;
        const cellH = h / rows;
        modules += rect(col * cellW + cellW * (1 - p) / 2, row * cellH + cellH * (1 - p) / 2, cellW * p + 0.3, cellH * p + 0.3, '#fff', 8 * (1 - p));
      }
    }
    const grid = clip(modules);
    body += `<g clip-path="${grid}">${rect(0, 0, w, h, '#5142a4')}`;
    const slide = ramp(t, 1.65, 2.7);
    if (portrait) {
      body += image('building', 21 - (1 - slide) * 160, 24, 357, 246, { cover: true, radius: 3 });
      body += image('mug', 235 + (1 - slide) * 160, 283, 342, 280, { cover: true, radius: 3 });
      body += image('flag', 23, 501 + (1 - slide) * 140, 300, 226, { cover: true, radius: 3 });
    } else {
      body += image('building', 25 - (1 - slide) * 180, 30, 421, 291, { cover: true, radius: 4 });
      body += image('mug', 562 + (1 - slide) * 180, 29, 370, 303, { cover: true, radius: 4 });
      body += image('flag', 275, 290 + (1 - slide) * 150, 381, 221, { cover: true, radius: 4 });
    }
    body += '</g>';
  } else if (slug === 'u-wanna-smoothie') {
    const logoSize = portrait ? 460 : 410;
    const cx = w / 2;
    const cy = h / 2;
    body += circle(cx, cy, logoSize * 0.57, '#fff7d5');
    const logoCircle = clip(circle(cx, cy, logoSize / 2, '#fff'));
    body += image('identity', cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize, { mask: logoCircle });
    const wavePath = (level, amplitude, phase) => {
      let d = `M0 ${h + 5}L0 ${n(level)}`;
      for (let x = 0; x <= w; x += w / 40) {
        const y = level + Math.sin(x / w * Math.PI * 3 + phase) * amplitude + Math.sin(x / w * Math.PI * 5 - phase * 0.7) * amplitude * 0.25;
        d += `L${n(x)} ${n(y)}`;
      }
      return `${d}L${w} ${h + 5}Z`;
    };
    const wave = application;
    const level = h + 90 - wave * (h + 180);
    const amplitude = 42 * Math.sin(Math.PI * wave);
    body += `<path d="${wavePath(level - 18, amplitude, t * 1.5)}" fill="#bbd36f"/>`;
    const liquid = clip(`<path d="${wavePath(level, amplitude, t * 1.5)}"/>`);
    body += `<g clip-path="${liquid}">${rect(0, 0, w, h, '#fce7a5')}`;
    const settle = ramp(t, 1.7, 2.75);
    if (portrait) {
      body += image('cup', 20, 32 + (1 - settle) * 90, 257, 431, { cover: true, radius: 110 });
      const drinkClip = clip(circle(429, 298, 151, '#fff'));
      body += image('drink', 278, 147, 302, 302, { cover: true, mask: drinkClip });
      body += image('menu', 28, 482, w - 56, 235, { cover: true, radius: 24 });
    } else {
      body += image('cup', 30, 28 + (1 - settle) * 90, 275, 461, { cover: true, radius: 130 });
      const drinkClip = clip(circle(499, 205, 157, '#fff'));
      body += image('drink', 342, 48, 314, 314, { cover: true, mask: drinkClip });
      body += image('menu', 377, 326, 550, 183, { cover: true, radius: 24 });
      body += circle(796, 146, 72, '#ed5778');
      body += circle(851, 220, 35, '#a8c44f');
    }
    body += '</g>';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs.join('')}</defs>${body}</svg>`;
}
