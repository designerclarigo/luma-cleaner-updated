// Encode the local Expo address without sending it to an external QR service.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { toQR } = require('toqr');
const address = process.argv[2];
if (!address || !/^exp:\/\/[\w.:-]+$/.test(address)) throw new Error('Pass the exp:// address printed by Expo.');
const qr = toQR(address);
const count = Math.sqrt(qr.length);
const quiet = 4, scale = 10, size = (count + quiet * 2) * scale;
const pixels = Buffer.alloc((size + 1) * size, 255);
for (let y = 0; y < size; y++) {
  pixels[y * (size + 1)] = 0;
  for (let x = 0; x < size; x++) {
    const row = Math.floor(y / scale) - quiet, col = Math.floor(x / scale) - quiet;
    if (row >= 0 && row < count && col >= 0 && col < count)
      pixels[y * (size + 1) + x + 1] = qr[row * count + col] ? 255 : 0;
  }
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8;
const output = path.join(__dirname, '..', '.expo', 'expo-go-qr.png');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]));
console.log(output);
