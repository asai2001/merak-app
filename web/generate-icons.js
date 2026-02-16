// Generate PWA icons - simple green peacock icon
// Run: node generate-icons.js

const fs = require('fs');
const path = require('path');

function isInRoundedRect(x, y, w, h, r) {
    if (x < r && y < r) return (x - r) ** 2 + (y - r) ** 2 <= r ** 2;
    if (x >= w - r && y < r) return (x - (w - r)) ** 2 + (y - r) ** 2 <= r ** 2;
    if (x < r && y >= h - r) return (x - r) ** 2 + (y - (h - r)) ** 2 <= r ** 2;
    if (x >= w - r && y >= h - r) return (x - (w - r)) ** 2 + (y - (h - r)) ** 2 <= r ** 2;
    return true;
}

function isInEllipse(x, y, cx, cy, rx, ry) {
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

function isInCircle(x, y, cx, cy, r) {
    return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function createIcon(size, outputPath) {
    const { PNG } = require('pngjs');
    const png = new PNG({ width: size, height: size });
    const s = size / 512; // scale factor
    const cr = Math.floor(size * 0.18);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (size * y + x) * 4;

            if (!isInRoundedRect(x, y, size, size, cr)) {
                png.data[idx] = png.data[idx + 1] = png.data[idx + 2] = png.data[idx + 3] = 0;
                continue;
            }

            // Default: green background
            let r = 22, g = 163, b = 74, a = 255;

            // Coordinates relative to center
            const cx = x / s, cy = y / s;

            // === TAIL FEATHERS (fan behind body) ===
            const tailCX = 256, tailCY = 200;
            const featherAngles = [-35, -17, 0, 17, 35];
            let isFeather = false;
            let isEyeSpot = false;

            for (const angle of featherAngles) {
                const rad = angle * Math.PI / 180;
                const cos = Math.cos(rad), sin = Math.sin(rad);
                // Rotated coordinates
                const rx = (cx - tailCX) * cos + (cy - tailCY) * sin;
                const ry = -(cx - tailCX) * sin + (cy - tailCY) * cos;

                if (Math.abs(rx) < 30 && ry > -180 && ry < -20) {
                    // Feather shape - wider at top
                    const widthAtY = 28 * (1 - (ry + 180) / 200);
                    if (Math.abs(rx) < widthAtY) {
                        isFeather = true;
                        // Eye spot near tip
                        const spotY = -140;
                        if (Math.abs(ry - spotY) < 18 && Math.abs(rx) < 14) {
                            isEyeSpot = true;
                            if (Math.abs(ry - spotY) < 10 && Math.abs(rx) < 8) {
                                r = 20; g = 184; b = 166; // teal inner
                            } else {
                                r = 13; g = 148; b = 136; // darker teal outer
                            }
                        } else {
                            // Gradient feather color
                            const t = (ry + 180) / 160;
                            r = Math.round(167 + t * (-115));
                            g = Math.round(243 + t * (-116));
                            b = Math.round(208 + t * (-100));
                        }
                    }
                }
            }

            // === BODY (ellipse) ===
            if (isInEllipse(cx, cy, 256, 310, 55, 75)) {
                r = 5; g = 150; b = 105;
                isFeather = false;
            }

            // === NECK ===
            if (isInEllipse(cx, cy, 256, 240, 24, 55)) {
                r = 4; g = 120; b = 87;
                isFeather = false;
            }

            // === HEAD ===
            if (isInCircle(cx, cy, 256, 195, 32)) {
                r = 4; g = 120; b = 87;
                isFeather = false;

                // Eye white
                if (isInCircle(cx, cy, 267, 190, 7)) {
                    r = 255; g = 255; b = 255;
                }
                // Eye pupil
                if (isInCircle(cx, cy, 269, 190, 3.5)) {
                    r = 30; g = 41; b = 59;
                }
            }

            // === BEAK ===
            if (cx > 280 && cx < 305 && cy > 186 && cy < 200) {
                const beakY = 193;
                const beakW = (cx - 280) * 0.5;
                if (Math.abs(cy - beakY) < 8 - beakW) {
                    r = 245; g = 158; b = 11; // amber
                    isFeather = false;
                }
            }

            // === CROWN (3 dots on top of head) ===
            if (isInCircle(cx, cy, 245, 148, 5)) { r = 110; g = 231; b = 183; isFeather = false; }
            if (isInCircle(cx, cy, 256, 143, 5)) { r = 110; g = 231; b = 183; isFeather = false; }
            if (isInCircle(cx, cy, 267, 148, 5)) { r = 110; g = 231; b = 183; isFeather = false; }
            // Crown stems
            const stemCheck = (sx, sy, ex, ey) => {
                const d = dist(cx, cy, (sx + ex) / 2, (sy + ey) / 2);
                const len = dist(sx, sy, ex, ey);
                return d < len / 2 + 2 && Math.abs((cy - sy) * (ex - sx) - (cx - sx) * (ey - sy)) / len < 2;
            };
            if (stemCheck(250, 168, 245, 152)) { r = 52; g = 211; b = 153; isFeather = false; }
            if (stemCheck(256, 166, 256, 147)) { r = 52; g = 211; b = 153; isFeather = false; }
            if (stemCheck(262, 168, 267, 152)) { r = 52; g = 211; b = 153; isFeather = false; }

            // === FEET ===
            if (cy > 370 && cy < 405) {
                if ((Math.abs(cx - 232) < 3 && cy > 370) || (Math.abs(cx - 280) < 3 && cy > 370)) {
                    r = 245; g = 158; b = 11;
                    isFeather = false;
                }
            }

            // Write only if feather/body part or background
            if (!isFeather && !isInEllipse(cx, cy, 256, 310, 55, 75) &&
                !isInEllipse(cx, cy, 256, 240, 24, 55) && !isInCircle(cx, cy, 256, 195, 32)) {
                // Keep as green background (already set)
            }

            png.data[idx] = r;
            png.data[idx + 1] = g;
            png.data[idx + 2] = b;
            png.data[idx + 3] = a;
        }
    }

    const buffer = PNG.sync.write(png);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created ${outputPath} (${size}x${size}, ${buffer.length} bytes)`);
}

// Install pngjs if needed, then generate
try {
    require('pngjs');
} catch (e) {
    console.log('Installing pngjs...');
    require('child_process').execSync('npm install pngjs --no-save', { stdio: 'inherit', cwd: __dirname });
}

createIcon(192, path.join(__dirname, 'public', 'icon-192.png'));
createIcon(512, path.join(__dirname, 'public', 'icon-512.png'));
console.log('Done!');
