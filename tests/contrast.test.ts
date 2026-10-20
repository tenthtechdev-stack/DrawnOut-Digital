import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const footer = await readFile(
  new URL('../src/components/SiteFooter.astro', import.meta.url),
  'utf8',
);
const footerBackground = footer.match(/\.site-footer\s*\{\s*background:\s*(#[\da-f]{6})/i)?.[1];
assert.ok(
  footerBackground,
  'Resolve the real footer background before evaluating its text contrast.',
);

function token(name: string): string {
  const color = css.match(new RegExp(`--${name}:\\s*(#[\\da-f]{6})\\s*;`, 'i'))?.[1];
  assert.ok(
    color,
    `The ${name} token must be an explicit six-digit sRGB color for contrast validation.`,
  );
  return color;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const pair = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (pair[0]! + 0.05) / (pair[1]! + 0.05);
}

const pairs = [
  { text: 'ink', background: token('paper'), surface: 'paper' },
  { text: 'muted', background: token('paper'), surface: 'paper' },
  { text: 'accent-strong', background: token('paper'), surface: 'paper' },
  { text: 'cream', background: token('ink'), surface: 'ink' },
  { text: 'amber', background: footerBackground, surface: 'footer' },
  { text: 'inverse-muted', background: footerBackground, surface: 'footer' },
];

for (const pair of pairs) {
  const ratio = contrast(token(pair.text), pair.background);
  test(`${pair.text} text on ${pair.surface} meets AA body-text contrast (${ratio.toFixed(2)}:1)`, () => {
    assert.ok(
      ratio >= 4.5,
      `${pair.text} on ${pair.surface} needs 4.5:1; observed ${ratio.toFixed(2)}:1.`,
    );
  });
}
