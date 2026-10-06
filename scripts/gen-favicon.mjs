/**
 * Generates app/favicon.ico from the same monogram as app/icon.svg, at 16/32/48px.
 *
 * The .ico is generated (rather than hand-drawn) because browsers prefer
 * /favicon.ico over the SVG icon, so both have to stay in sync. Run with:
 *   node scripts/gen-favicon.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "favicon.ico");
const SIZES = [16, 32, 48];

/** Design in a 32x32 coordinate space, matching app/icon.svg. */
const BG = [0x18, 0x18, 0x18];
const FG = [0xf3, 0xf3, 0xf3];
const ACCENT = [0x94, 0x0a, 0x0a];
const BARS = [
  { x: 8, y: 6, w: 16, h: 5, color: FG },
  { x: 8, y: 13.5, w: 12.5, h: 5, color: ACCENT },
  { x: 8, y: 21, w: 16, h: 5, color: FG },
];
const RADIUS = 7;
const SAMPLES = 4; // supersampling grid per axis, for antialiased corners

function inRoundedRect(x, y, size) {
  const r = RADIUS * (size / 32);
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  return Math.hypot(x - cx, y - cy) <= r;
}

function sample(u, v) {
  const x = u * 32;
  const y = v * 32;
  for (const bar of BARS) {
    if (x >= bar.x && x < bar.x + bar.w && y >= bar.y && y < bar.y + bar.h)
      return bar.color;
  }
  return BG;
}

/** RGBA pixel grid, top-down, with antialiased rounded corners. */
function pixels(size) {
  const out = new Uint8Array(size * size * 4);
  const step = 1 / (32 * SAMPLES);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const u = px + (sx + 0.5) / (size * SAMPLES);
          const v = py + (sy + 0.5) / (size * SAMPLES);
          const [sr, sg, sb] = sample(u, v);
          r += sr; g += sg; b += sb;
          if (inRoundedRect(u * size, v * size, size)) a++;
        }
      }

      const n = SAMPLES * SAMPLES;
      const i = (py * size + px) * 4;
      out[i] = Math.round(r / n);
      out[i + 1] = Math.round(g / n);
      out[i + 2] = Math.round(b / n);
      out[i + 3] = Math.round((a / n) * 255);
    }
  }

  return out;
}

/** One ICO entry: 32-bit BGRA DIB, bottom-up, XOR bitmap followed by AND mask. */
function entry(size) {
  const rgba = pixels(size);
  const header = 40;
  const xor = Buffer.alloc(size * size * 4);
  const andStride = Math.ceil(size / 32) * 4;
  const and = Buffer.alloc(andStride * size);
  const pixelsData = Buffer.alloc(xor.length + and.length);

  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * size * 4; // DIB rows are bottom-up
    const dst = y * size * 4;
    for (let x = 0; x < size; x++) {
      const s = src + x * 4;
      const d = dst + x * 4;
      xor[d] = rgba[s + 2];
      xor[d + 1] = rgba[s + 1];
      xor[d + 2] = rgba[s];
      xor[d + 3] = rgba[s + 3];

      // AND mask: 1 = transparent. Rows are also bottom-up and padded to 4 bytes.
      const bit = 7 - (x % 8);
      if (rgba[s + 3] === 0) and[y * andStride + (x >> 3)] |= 1 << bit;
    }
  }

  xor.copy(pixelsData, 0);
  and.copy(pixelsData, xor.length);

  const dir = Buffer.alloc(16);
  dir.writeUInt8(size === 256 ? 0 : size, 0); // width, 0 means 256
  dir.writeUInt8(size === 256 ? 0 : size, 1); // height
  dir.writeUInt8(1, 2); // palette
  dir.writeUInt8(0, 3); // reserved
  dir.writeUInt16LE(1, 4); // color planes
  dir.writeUInt16LE(32, 6); // bits per pixel
  dir.writeUInt32LE(header + pixelsData.length, 8); // dwBytesInRes, DIB header included
  dir.writeUInt32LE(0, 12); // dwImageOffset, patched after all sizes are known

  const dib = Buffer.alloc(header);
  dib.writeUInt32LE(header, 0); // header size
  dib.writeInt32LE(size, 4); // width
  dib.writeInt32LE(size * 2, 8); // height incl. AND mask
  dib.writeUInt16LE(1, 12); // planes
  dib.writeUInt16LE(32, 14); // bpp
  dib.writeUInt32LE(0, 16); // BI_RGB
  dib.writeUInt32LE(xor.length, 20);

  return { dir, image: Buffer.concat([dib, pixelsData]) };
}

const entries = SIZES.map(entry);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // ICO
header.writeUInt16LE(entries.length, 4);

let offset = 6 + entries.length * 16;
const dirs = [];
const images = [];

for (const { dir, image } of entries) {
  dir.writeUInt32LE(offset, 12);
  offset += image.length;
  dirs.push(dir);
  images.push(image);
}

writeFileSync(OUT, Buffer.concat([header, ...dirs, ...images]));
console.log(`wrote ${OUT} (${SIZES.join(", ")}px)`);