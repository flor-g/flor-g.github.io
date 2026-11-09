// Renders a still frame of the Gray–Scott reaction–diffusion pattern that used to
// animate behind the homepage (same parameters, kernel and colour as the old
// turingPattern.js), and writes it as a transparent PNG.
//
// Usage: node tools/turing-snapshot.mjs <steps> <out.png> [--preview]
//   --preview  paints the page background behind the pattern at full strength,
//              which makes candidate frames easier to compare by eye.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const [stepsArg, out, flag] = process.argv.slice(2);
const steps = Number(stepsArg);
if (!Number.isInteger(steps) || !out) {
  console.error('Usage: node tools/turing-snapshot.mjs <steps> <out.png> [--preview]');
  process.exit(1);
}
const preview = flag === '--preview';

const W = 256;
const H = 256;
const SEED_HALF = 20; // 40 x 40 seed square, as in turingPattern.js
const dA = 1.0, dB = 0.5, feed = 0.05, kill = 0.062, dt = 1.0;

// Deterministic noise so the same step count always gives the same image.
let rng = 20261109;
const random = () => ((rng = (rng * 1664525 + 1013904223) >>> 0) / 4294967296);

let A = new Float32Array(W * H).fill(1);
let B = new Float32Array(W * H);
let nA = new Float32Array(W * H);
let nB = new Float32Array(W * H);
const cx = W >> 1, cy = H >> 1;
for (let y = cy - SEED_HALF; y < cy + SEED_HALF; y++)
  for (let x = cx - SEED_HALF; x < cx + SEED_HALF; x++) B[y * W + x] = 1;
for (let i = 0; i < W * H; i++) B[i] += random() * 0.02;

const lap = (arr, x, y) => {
  const xm = (x - 1 + W) % W, xp = (x + 1) % W, ym = (y - 1 + H) % H, yp = (y + 1) % H;
  return -arr[y * W + x]
    + 0.2 * (arr[y * W + xm] + arr[y * W + xp] + arr[ym * W + x] + arr[yp * W + x])
    + 0.05 * (arr[ym * W + xm] + arr[ym * W + xp] + arr[yp * W + xm] + arr[yp * W + xp]);
};

for (let s = 0; s < steps; s++) {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, a = A[i], b = B[i], r = a * b * b;
      nA[i] = Math.max(0, Math.min(1, a + (dA * lap(A, x, y) - r + feed * (1 - a)) * dt));
      nB[i] = Math.max(0, Math.min(1, b + (dB * lap(B, x, y) + r - (kill + feed) * b) * dt));
    }
  [A, nA] = [nA, A];
  [B, nB] = [nB, B];
}

// Same colour mapping as turingPattern.js: rgb(204,120,92), alpha up to 70.
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const v = Math.max(0, (B[y * W + x] - 0.2) / 0.8);
    const o = y * (W * 4 + 1) + 1 + x * 4;
    if (preview) {
      const t = Math.min(1, v * 3);
      const bg = [230, 228, 227], fg = [204, 120, 92];
      for (let c = 0; c < 3; c++) raw[o + c] = Math.round(bg[c] + (fg[c] - bg[c]) * t);
      raw[o + 3] = 255;
    } else {
      raw.set([204, 120, 92, Math.floor(v * 70)], o);
    }
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
writeFileSync(
  out,
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
);
console.log(`${out}: ${steps} steps`);
