// Builds the "keepsake" card that is shown after sending and downloaded from the QR page:
// a dark NESCAFÉ card with the visitor's name and profession, their leaf design with a red outline,
// the brand name down the right edge and a few falling leaves. Everything is drawn on a canvas,
// so the PNG that is shown is exactly the PNG that is downloaded.

export const FRAME_W = 1200;
export const FRAME_H = 960;

const RED = "#EB1C23";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// Crops transparent margins so the leaf can be centred and scaled to fit the card.
function trimmed(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return { source: canvas, w: width, h: height };
  const w = right - left + 1;
  const h = bottom - top + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d").drawImage(canvas, left, top, w, h, 0, 0, w, h);
  return { source: out, w, h };
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A small pointed leaf, like the confetti on the NESCAFÉ cards.
function drawLeaf(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 1.15, -size * 0.5, size * 1.0, size * 0.6, 0, size);
  ctx.bezierCurveTo(size * 0.45, size * 0.2, size * 0.35, -size * 0.45, 0, -size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const CONFETTI = [
  [118, 790, 30, 25, "#F5B729"],
  [200, 860, 24, -40, RED],
  [420, 905, 20, 60, "#F28A1E"],
  [800, 905, 34, -20, RED],
  [930, 820, 22, 35, "#F5B729"],
  [650, 118, 22, 20, "#F28A1E"],
  [860, 96, 28, -35, RED],
  [60, 560, 20, 50, RED],
  [905, 160, 18, 70, "#F5B729"],
  [1000, 90, 26, 15, "#F28A1E"]
];

// design: data URL or URL of the leaf PNG. Resolves to a PNG Blob.
export async function composeFrame({ design, name, profession }) {
  await Promise.all([
    document.fonts.load('700 64px "Nescafe Sans"'),
    document.fonts.load('400 28px "Myriad Pro"')
  ]).catch(() => {});

  const leaf = trimmed(await loadImage(design));
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_W;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext("2d");

  // card
  ctx.save();
  roundedRect(ctx, 0, 0, FRAME_W, FRAME_H, 64);
  ctx.clip();
  const bg = ctx.createRadialGradient(FRAME_W * 0.4, FRAME_H * 0.5, 80, FRAME_W * 0.5, FRAME_H * 0.5, FRAME_W * 0.75);
  bg.addColorStop(0, "#2b0a0e");
  bg.addColorStop(1, "#0f0304");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  ctx.restore();
  ctx.lineWidth = 10;
  ctx.strokeStyle = RED;
  roundedRect(ctx, 5, 5, FRAME_W - 10, FRAME_H - 10, 60);
  ctx.stroke();

  CONFETTI.forEach(([x, y, size, angle, color]) => drawLeaf(ctx, x, y, size, angle, color));

  // name + profession, top left
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const cleanName = (name || "").trim() || "Your world";
  ctx.fillStyle = "#ffffff";
  let nameSize = 76;
  ctx.font = `700 ${nameSize}px "Nescafe Sans", Arial, sans-serif`;
  while (ctx.measureText(cleanName).width > 600 && nameSize > 40) {
    nameSize -= 4;
    ctx.font = `700 ${nameSize}px "Nescafe Sans", Arial, sans-serif`;
  }
  ctx.fillText(cleanName, 84, 140);
  if (profession) {
    ctx.fillStyle = "rgba(255,255,255,.62)";
    ctx.font = '400 30px "Myriad Pro", Arial, sans-serif';
    ctx.letterSpacing = "6px";
    ctx.fillText(profession.toUpperCase(), 86, 190);
    ctx.letterSpacing = "0px";
  }

  // the leaf design, outlined in red
  const areaX = 84;
  const areaY = 230;
  const areaW = 820;
  const areaH = 610;
  const scale = Math.min(areaW / leaf.w, areaH / leaf.h);
  const dw = leaf.w * scale;
  const dh = leaf.h * scale;
  const dx = areaX + (areaW - dw) / 2;
  const dy = areaY + (areaH - dh) / 2;

  const silhouette = document.createElement("canvas");
  silhouette.width = Math.ceil(dw);
  silhouette.height = Math.ceil(dh);
  const sctx = silhouette.getContext("2d");
  sctx.drawImage(leaf.source, 0, 0, silhouette.width, silhouette.height);
  sctx.globalCompositeOperation = "source-in";
  sctx.fillStyle = RED;
  sctx.fillRect(0, 0, silhouette.width, silhouette.height);

  ctx.save();
  ctx.shadowColor = "rgba(235,28,35,.55)";
  ctx.shadowBlur = 40;
  const ring = 9;
  for (let step = 0; step < 24; step++) {
    const angle = (step / 24) * Math.PI * 2;
    ctx.drawImage(silhouette, dx + Math.cos(angle) * ring, dy + Math.sin(angle) * ring);
  }
  ctx.restore();
  ctx.drawImage(leaf.source, dx, dy, dw, dh);

  // NESCAFÉ down the right edge
  ctx.save();
  ctx.translate(FRAME_W - 135, FRAME_H / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0px";
  ctx.font = '700 100px "Nescafe Sans", Arial, sans-serif';
  const wordSize = Math.min(190, (100 * (FRAME_H - 150)) / ctx.measureText("NESCAFÉ").width);
  ctx.font = `700 ${wordSize}px "Nescafe Sans", Arial, sans-serif`;
  ctx.fillText("NESCAFÉ", 0, 0);
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.font = '400 26px "Myriad Pro", Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.letterSpacing = "6px";
  ctx.fillText("MAKE YOUR WORLD", 86, FRAME_H - 56);
  ctx.letterSpacing = "0px";

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not build your card"))), "image/png");
  });
}
