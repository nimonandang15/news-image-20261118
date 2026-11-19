// News poster for Wednesday 18 November 2026 — pure Node 22 stdlib.
// Draws a 1024x1024 editorial front page with a 5x7 bitmap font and writes
// a deterministic PNG (zlib + CRC32, no timestamps) to /output/entry.png.
// Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;

// ---- palette: editorial newspaper, navy + red + gold on cream ----
const PAPER = [247, 242, 231];
const INK = [20, 33, 61];
const NAVY = [20, 33, 61];
const RED = [178, 34, 34];
const GOLD = [176, 141, 45];
const WHITE = [255, 255, 255];
const GREY = [90, 96, 108];
const CARD = [255, 255, 255];
const TEAL = [14, 110, 105];

// ---- 5x7 bitmap font: each glyph = 7 rows of 5 bits ----
const FONT: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ',': [0, 0, 0, 0, 0x0c, 0x04, 0x08],
  ':': [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  ';': [0, 0x0c, 0x0c, 0, 0x0c, 0x04, 0x08],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0],
  '-': [0, 0, 0, 0x0e, 0, 0, 0],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '/': [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  '$': [0x04, 0x0f, 0x14, 0x0e, 0x05, 0x1e, 0x04],
  '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  '&': [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04],
  '+': [0, 0x04, 0x04, 0x0e, 0x04, 0x04, 0],
  '=': [0, 0, 0x1f, 0, 0x1f, 0, 0],
  '"': [0x0a, 0x0a, 0x0a, 0, 0, 0, 0],
};

// ---- pixel canvas ----
const px = new Uint8Array(W * H * 3);
function fill(c: number[]) {
  for (let i = 0; i < W * H; i++) { px[i * 3] = c[0]; px[i * 3 + 1] = c[1]; px[i * 3 + 2] = c[2]; }
}
function rect(x: number, y: number, w: number, h: number, c: number[]) {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
  for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) {
    const o = (j * W + i) * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2];
  }
}
function circle(cx: number, cy: number, r: number, c: number[]) {
  for (let j = cy - r; j <= cy + r; j++) for (let i = cx - r; i <= cx + r; i++) {
    if (i < 0 || j < 0 || i >= W || j >= H) continue;
    if ((i - cx) * (i - cx) + (j - cy) * (j - cy) <= r * r) {
      const o = (j * W + i) * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2];
    }
  }
}
function ring(cx: number, cy: number, r: number, t: number, c: number[]) {
  for (let j = cy - r - t; j <= cy + r + t; j++) for (let i = cx - r - t; i <= cx + r + t; i++) {
    if (i < 0 || j < 0 || i >= W || j >= H) continue;
    const d = Math.sqrt((i - cx) * (i - cx) + (j - cy) * (j - cy));
    if (Math.abs(d - r) <= t / 2) { const o = (j * W + i) * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; }
  }
}

// ---- text: scale s => char 6s wide, 7s tall ----
function textWidth(s: string, sc: number) { return s.length * 6 * sc - sc; }
function drawText(x: number, y: number, s: string, sc: number, c: number[]) {
  const up = s.toUpperCase();
  for (let k = 0; k < up.length; k++) {
    const g = FONT[up[k]] ?? FONT['?'];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
      if ((g[r] >> (4 - col)) & 1) rect(x + k * 6 * sc + col * sc, y + r * sc, sc, sc, c);
    }
  }
}
function drawCentered(y: number, s: string, sc: number, c: number[]) {
  drawText(Math.round((W - textWidth(s, sc)) / 2), y, s, sc, c);
}
// Wrap text to max width; returns lines. Splits long words if needed.
function wrap(s: string, sc: number, maxW: number): string[] {
  const words = s.toUpperCase().split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (textWidth(trial, sc) <= maxW) { cur = trial; continue; }
    if (cur) lines.push(cur);
    cur = textWidth(w, sc) <= maxW ? w : w.slice(0, Math.max(1, Math.floor(maxW / (6 * sc))));
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawPara(x: number, y: number, s: string, sc: number, maxW: number, c: number[], lh?: number): number {
  const lines = wrap(s, sc, maxW);
  const step = lh ?? Math.round(7 * sc * 1.45);
  lines.forEach((ln, i) => drawText(x, y + i * step, ln, sc, c));
  return y + lines.length * step;
}

// ---- deterministic PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ================= layout =================
fill(PAPER);

// ---- masthead ----
rect(0, 0, W, 148, NAVY);
rect(0, 148, W, 6, GOLD);
drawCentered(18, 'THE WORLD IN ONE DAY', 7, WHITE);
drawCentered(82, 'WEDNESDAY 18 NOVEMBER 2026', 4, GOLD);
drawCentered(122, 'SIX STORIES THAT DEFINED THE DAY', 2, [200, 208, 220]);

// ---- lead story: Xi meets Putin ----
rect(28, 172, 968, 252, CARD);
rect(28, 172, 968, 8, RED);
drawText(52, 196, '1  LEAD STORY  -  ASIA', 2, RED);
drawText(52, 228, 'XI MEETS PUTIN IN', 6, INK);
drawText(52, 276, 'SHENZHEN', 6, INK);
drawPara(52, 330, 'A day before the first three-way summit with President Trump, the Chinese and Russian leaders open talks at the APEC forum. Ukraine, Iran and trade top the agenda.', 2, 560, INK);
// globe pictogram, right side
circle(858, 300, 78, [216, 228, 240]);
ring(858, 300, 78, 5, NAVY);
ring(858, 300, 52, 3, NAVY);
rect(786, 296, 144, 4, NAVY);
rect(854, 226, 4, 148, NAVY);
circle(858, 300, 10, RED);

// ---- row A: three cards ----
function card(x: number, y: number, w: number, h: number, accent: number[], num: string, kicker: string, head: string, body: string) {
  rect(x, y, w, h, CARD);
  rect(x, y, w, 6, accent);
  rect(x + 18, y + 22, 34, 34, accent);
  drawText(x + 27, y + 31, num, 3, WHITE);
  drawText(x + 64, y + 32, kicker, 2, accent);
  drawPara(x + 18, y + 72, head, 3, w - 36, INK, 32);
  drawPara(x + 18, y + 72 + 3 * 32 + 8, body, 2, w - 36, GREY, 20);
}
card(28, 444, 312, 252, RED, '2', 'MIDDLE EAST', 'IRAN STRIKES AT GULF BASES', 'Iran says it hit US sites in Kuwait and Bahrain.');
card(356, 444, 312, 252, NAVY, '3', 'UKRAINE WAR', 'CRIMEA BRIDGE HIT', 'Ukrainian drones partly collapse the Kerch bridge arch.');
card(684, 444, 312, 252, TEAL, '4', 'US POLITICS', 'DEMOCRATS TAKE ALASKA SENATE', 'Mary Peltola beats Dan Sullivan. Democrats lead the Senate 56-44.');

// ---- row B: two wide cards ----
function wideCard(x: number, y: number, w: number, accent: number[], num: string, kicker: string, head: string, body: string) {
  rect(x, y, w, 128, CARD);
  rect(x, y, 6, 128, accent);
  rect(x + 22, y + 16, 34, 34, accent);
  drawText(x + 31, y + 25, num, 3, WHITE);
  drawText(x + 68, y + 26, kicker, 2, accent);
  drawText(x + 22, y + 60, head, 3, INK);
  drawPara(x + 22, y + 94, body, 2, w - 44, GREY, 20);
}
wideCard(28, 716, 478, GOLD, '5', 'HEALTH', 'US LOSES MEASLES STATUS', 'PAHO ends the status after 26 years: 5,400+ cases, 10 deaths.');
wideCard(518, 716, 478, RED, '6', 'TECH + MARKETS', 'NVIDIA: $115.8BN QUARTER', 'Revenue doubles, up 103%. No return for ex-CEO Jensen Huang.');

// ---- footer ----
rect(0, 872, W, 6, GOLD);
rect(0, 878, W, 146, NAVY);
drawCentered(900, 'ONE DAY. SIX STORIES. THE WORLD, 18 NOVEMBER 2026.', 3, WHITE);
drawCentered(946, 'SOURCES: AP - REUTERS - AFP - BBC - PAHO - NVIDIA', 2, GOLD);
drawCentered(976, 'ALL EVENTS REPORTED ON WEDNESDAY 18 NOVEMBER 2026', 2, [200, 208, 220]);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG());
