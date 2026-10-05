import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateFavicons() {
  console.log('--- Generating Google Search Compliant Favicons ---');
  const svgPath = path.resolve('frontend/public/assets/logo/logo.svg');
  const logoDir = path.resolve('frontend/public/assets/logo');
  const publicDir = path.resolve('frontend/public');

  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG file not found at: ${svgPath}`);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Google Search compliant sizes (multiples of 48px square)
  const sizes = [
    { name: 'favicon-48x48.png', size: 48, dest: logoDir },
    { name: 'favicon-96x96.png', size: 96, dest: logoDir },
    { name: 'favicon-144x144.png', size: 144, dest: logoDir },
    { name: 'favicon-192x192.png', size: 192, dest: logoDir },
    { name: 'favicon-512x512.png', size: 512, dest: logoDir },
    { name: 'apple-touch-icon.png', size: 180, dest: logoDir },
    // Also update existing favicon.png in logo directory with crisp 96x96
    { name: 'favicon.png', size: 96, dest: logoDir },
    // Also place apple-touch-icon in public root for standard crawlers
    { name: 'apple-touch-icon.png', size: 180, dest: publicDir },
  ];

  const pngBuffers = {};

  for (const item of sizes) {
    const outPath = path.join(item.dest, item.name);
    const buf = await sharp(svgBuffer)
      .resize(item.size, item.size, { fit: 'contain', background: { r: 17, g: 24, b: 39, alpha: 1 } })
      .png()
      .toBuffer();

    fs.writeFileSync(outPath, buf);
    pngBuffers[item.size] = buf;
    console.log(`Generated: ${path.relative('.', outPath)} (${item.size}x${item.size}) - ${buf.length} bytes`);
  }

  // 2. Build multi-resolution favicon.ico in root public/ directory (16x16, 32x32, 48x48)
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoImages = [
    { width: 16, height: 16, buffer: ico16 },
    { width: 32, height: 32, buffer: ico32 },
    { width: 48, height: 48, buffer: ico48 },
  ];

  // Windows ICO format specification
  const numImages = icoImages.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + numImages * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved. Must always be 0.
  header.writeUInt16LE(1, 2); // 1 = ICO file
  header.writeUInt16LE(numImages, 4); // Number of images

  const dirEntries = [];
  for (const img of icoImages) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0); // Width
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1); // Height
    entry.writeUInt8(0, 2); // Color palette: 0 for no palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image data size
    entry.writeUInt32LE(offset, 12); // Offset of image data
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...dirEntries,
    ...icoImages.map((img) => img.buffer),
  ]);

  const icoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Generated: ${path.relative('.', icoPath)} (Multi-res 16/32/48 ICO) - ${icoBuffer.length} bytes`);

  console.log('--- Favicons generation complete! ---');
}

generateFavicons().catch((err) => {
  console.error('Favicon generation error:', err);
  process.exit(1);
});
