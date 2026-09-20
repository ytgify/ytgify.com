import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import gifenc from 'gifenc';

const outputDirectory = path.resolve(process.argv[2] ?? '.workflows/local/source-policy-fixtures');
const { GIFEncoder } = gifenc;
const supportedBoundary = 10 * 1024 * 1024;
const fixtures = [
  ['supported-10MiB.gif', supportedBoundary],
  ['best-effort-over-10MiB.gif', supportedBoundary + 1],
  ['best-effort-over-25MB.gif', 25_000_001],
];

function decodedWorkload() {
  const width = 256;
  const height = 256;
  const frameCount = 115;
  const palette = Array.from({ length: 256 }, (_, index) => [
    (index * 73) % 256,
    (index * 151) % 256,
    (index * 199) % 256,
  ]);
  let state = 0x6d2b79f5;
  const encoder = GIFEncoder();
  for (let frame = 0; frame < frameCount; frame++) {
    const indexed = new Uint8Array(width * height);
    for (let pixel = 0; pixel < indexed.length; pixel++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      indexed[pixel] = state & 255;
    }
    encoder.writeFrame(indexed, width, height, {
      palette,
      delay: 100,
      repeat: 0,
      dispose: 2,
      first: frame === 0,
    });
  }
  encoder.finish();
  return { bytes: Buffer.from(encoder.bytes()), width, height, frameCount };
}

mkdirSync(outputDirectory, { recursive: true });
const workload = decodedWorkload();
if (workload.bytes.length > supportedBoundary)
  throw new Error(
    `Decoded workload exceeds the supported boundary by ${workload.bytes.length - supportedBoundary} bytes.`,
  );
for (const [name, bytes] of fixtures) {
  if (workload.bytes.length > bytes) throw new Error(`${name} is smaller than its decoded workload.`);
  const fixture = Buffer.alloc(bytes);
  workload.bytes.copy(fixture);
  writeFileSync(path.join(outputDirectory, name), fixture);
}

console.log(
  JSON.stringify(
    {
      outputDirectory,
      decodedWorkload: {
        encodedBytes: workload.bytes.length,
        width: workload.width,
        height: workload.height,
        frameCount: workload.frameCount,
        durationMilliseconds: workload.frameCount * 100,
      },
      fixtures: fixtures.map(([name, bytes]) => ({ name, bytes })),
      scope:
        'Each fixture contains the same deterministic 256x256, 115-frame decoded workload. Boundary padding follows the GIF trailer so source-byte policy can vary independently.',
    },
    null,
    2,
  ),
);
