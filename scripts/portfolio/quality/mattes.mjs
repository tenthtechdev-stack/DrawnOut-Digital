/** Source-pixel segmentation. No glyphs are retyped, traced as replacement art or generated. */
export function partitionWordmark(data, width, height, wanted) {
  const count = width * height;
  const outside = new Uint8Array(count);
  const queue = new Uint32Array(count);
  let head = 0;
  let tail = 0;
  const isBackground = (p) => {
    const k = p * 4;
    return data[k] > 95 && data[k] > data[k + 1] * 1.55 && data[k] > data[k + 2] * 1.55;
  };
  const add = (p) => {
    if (!outside[p] && isBackground(p)) {
      outside[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    add(y * width);
    add(y * width + width - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    if (x > 0) add(p - 1);
    if (x < width - 1) add(p + 1);
    if (y > 0) add(p - width);
    if (y < height - 1) add(p + width);
  }
  // Discard independent background accents: keep the largest enclosed mark component.
  const visited = new Uint8Array(count);
  let largest = [];
  for (let first = 0; first < count; first++) {
    if (outside[first] || visited[first]) continue;
    head = 0;
    tail = 0;
    queue[tail++] = first;
    visited[first] = 1;
    const component = [];
    while (head < tail) {
      const p = queue[head++];
      component.push(p);
      const x = p % width;
      const y = Math.floor(p / width);
      for (const q of [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1,
      ]) {
        if (q >= 0 && !outside[q] && !visited[q]) {
          visited[q] = 1;
          queue[tail++] = q;
        }
      }
    }
    if (component.length > largest.length) largest = component;
  }
  const inside = new Uint8Array(count);
  for (const p of largest) inside[p] = 1;
  const labels = new Uint8Array(count);
  head = 0;
  tail = 0;
  const seedRects = [
    [1, 45, 80, 185, 286],
    [2, 202, 46, 315, 220],
    [3, 340, 40, 472, 207],
    [4, 491, 44, 590, 205],
    [5, 608, 64, 719, 230],
  ];
  for (let p = 0; p < count; p++) {
    if (!inside[p]) continue;
    const k = p * 4;
    const x = p % width;
    const y = Math.floor(p / width);
    let label = 0;
    if (data[k] > 180 && data[k + 1] > 105 && data[k + 2] < 95 && y > 185) label = 6;
    else if (y > 280 && x > 570) label = 6;
    else if (data[k] > 185 && data[k + 1] > 185 && data[k + 2] > 185) {
      for (const [id, x1, y1, x2, y2] of seedRects)
        if (x >= x1 && x < x2 && y >= y1 && y < y2) {
          label = id;
          break;
        }
    }
    if (label) {
      labels[p] = label;
      queue[tail++] = p;
    }
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    for (const q of [
      x > 0 ? p - 1 : -1,
      x < width - 1 ? p + 1 : -1,
      y > 0 ? p - width : -1,
      y < height - 1 ? p + width : -1,
    ]) {
      if (q >= 0 && inside[q] && !labels[q]) {
        labels[q] = labels[p];
        queue[tail++] = q;
      }
    }
  }
  if (wanted === 'base' || wanted.endsWith('-face')) {
    const white = new Uint8Array(count);
    for (let p = 0; p < count; p++) {
      const k = p * 4;
      white[p] = inside[p] && data[k] > 170 && data[k + 1] > 170 && data[k + 2] > 170 ? 1 : 0;
    }
    const whiteVisited = new Uint8Array(count);
    const components = [];
    for (let first = 0; first < count; first++) {
      if (!white[first] || whiteVisited[first]) continue;
      head = 0;
      tail = 0;
      queue[tail++] = first;
      whiteVisited[first] = 1;
      const component = [];
      while (head < tail) {
        const p = queue[head++];
        component.push(p);
        const x = p % width;
        const y = Math.floor(p / width);
        for (const q of [
          x > 0 ? p - 1 : -1,
          x < width - 1 ? p + 1 : -1,
          y > 0 ? p - width : -1,
          y < height - 1 ? p + width : -1,
        ]) {
          if (q >= 0 && white[q] && !whiteVisited[q]) {
            whiteVisited[q] = 1;
            queue[tail++] = q;
          }
        }
      }
      components.push(component);
    }
    const faceLabels = new Uint8Array(count);
    for (const [id, x1, y1, x2, y2] of seedRects) {
      let best = [];
      let bestCount = 0;
      for (const component of components) {
        let overlap = 0;
        for (const p of component) {
          const x = p % width;
          const y = Math.floor(p / width);
          if (x >= x1 && x < x2 && y >= y1 && y < y2) overlap++;
        }
        if (overlap > bestCount) {
          best = component;
          bestCount = overlap;
        }
      }
      for (const p of best) faceLabels[p] = id;
    }
    const id = {
      'letterB-face': 1,
      'letterU-face': 2,
      'letterN-face': 3,
      'letterZ-face': 4,
      'letterO-face': 5,
    }[wanted];
    for (let p = 0; p < count; p++)
      data[p * 4 + 3] =
        inside[p] && (wanted === 'base' ? !faceLabels[p] : faceLabels[p] === id) ? 255 : 0;
    return data;
  }
  const id = { letterB: 1, letterU: 2, letterN: 3, letterZ: 4, letterO: 5, promise: 6, whole: 0 }[
    wanted
  ];
  for (let p = 0; p < count; p++)
    data[p * 4 + 3] = inside[p] && (id === 0 || labels[p] === id) ? 255 : 0;
  return data;
}
