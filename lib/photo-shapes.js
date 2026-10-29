// Shapes the captured selfie can be cut into. Every path is drawn in a 0-100 box, so the same data
// clips the live camera preview (CSS/SVG) and the saved PNG (canvas Path2D).

const point = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
const polygon = (points) => `M${points.map(point).join("L")}Z`;
const around = (count, radius, startDeg = -90, cx = 50, cy = 50) =>
  Array.from({ length: count }, (_, i) => {
    const a = ((startDeg + (i * 360) / count) * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  });
const star = (tips, inner) =>
  polygon(Array.from({ length: tips * 2 }, (_, i) => {
    const a = ((-90 + (i * 180) / tips) * Math.PI) / 180;
    const r = i % 2 ? inner : 50;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  }));
// A smooth outline whose radius wobbles with the angle: flowers, clouds and blobs.
const wobble = (samples, radius) =>
  polygon(Array.from({ length: samples }, (_, i) => {
    const t = (i / samples) * Math.PI * 2;
    const r = radius(t);
    return [50 + r * Math.cos(t - Math.PI / 2), 50 + r * Math.sin(t - Math.PI / 2)];
  }));

export const PHOTO_SHAPES = [
  { id: "none", label: "No shape", path: null },
  { id: "circle", label: "Circle", path: "M0 50A50 50 0 1 0 100 50A50 50 0 1 0 0 50Z" },
  { id: "rounded", label: "Rounded", path: "M20 0H80A20 20 0 0 1 100 20V80A20 20 0 0 1 80 100H20A20 20 0 0 1 0 80V20A20 20 0 0 1 20 0Z" },
  // the NESCAFÉ leaf used on the editor canvas
  { id: "leaf", label: "Leaf", path: "M8 94C31 80 39 58 46 25C50 6 62 2 95 3C92 39 86 68 64 84C46 97 25 97 8 94Z" },
  { id: "heart", label: "Heart", path: "M50 94C20 72 1 54 1 31C1 15 13 4 27 4C37 4 46 10 50 19C54 10 63 4 73 4C87 4 99 15 99 31C99 54 80 72 50 94Z" },
  { id: "star", label: "Star", path: star(5, 22) },
  { id: "hexagon", label: "Hexagon", path: polygon(around(6, 50, 0)) },
  { id: "octagon", label: "Octagon", path: polygon(around(8, 50, -22.5)) },
  { id: "diamond", label: "Diamond", path: polygon([[50, 0], [100, 50], [50, 100], [0, 50]]) },
  { id: "flower", label: "Flower", path: wobble(160, (t) => 40 + 10 * Math.cos(8 * t)) },
  { id: "cloud", label: "Cloud", path: wobble(160, (t) => 38 + 7 * Math.cos(5 * t) + 5 * Math.cos(3 * t + 1)) },
  { id: "arch", label: "Arch", path: "M0 100V50A50 50 0 0 1 100 50V100Z" },
  { id: "drop", label: "Drop", path: "M50 0C50 0 90 42 90 64A40 40 0 0 1 10 64C10 42 50 0 50 0Z" },
  { id: "shield", label: "Shield", path: "M8 6H92V52C92 76 72 92 50 100C28 92 8 76 8 52Z" },
  { id: "burst", label: "Burst", path: star(12, 38) }
];

export const DEFAULT_PHOTO_SHAPE = "circle";
export const photoShape = (id) => PHOTO_SHAPES.find((shape) => shape.id === id) || PHOTO_SHAPES[1];

// Cuts a square canvas down to the shape (transparent outside it) and returns a PNG data URL.
export function shapedPhoto(source, shapeId, size = 512) {
  const shape = photoShape(shapeId);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (shape.path) {
    ctx.save();
    ctx.scale(size / 100, size / 100);
    ctx.clip(new Path2D(shape.path));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.drawImage(source, 0, 0, size, size);
  if (shape.path) ctx.restore();
  return canvas.toDataURL("image/png");
}
