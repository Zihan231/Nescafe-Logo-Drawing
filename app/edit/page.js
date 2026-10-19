"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowClockwise,
  CheckCircle,
  Eraser,
  FlipHorizontal,
  PaintBucket,
  PaintBrush,
  PaperPlaneTilt,
  PenNib,
  PencilSimple,
  Shapes,
  TextT,
  Trash,
  X
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const W = 760;
const H = 560;
const LEAF_SIZE = 560;
const LEAF_X = (W - LEAF_SIZE) / 2;
const STICKERS = [
  { src: "/assets/sticker-love.png", label: "Love" },
  { src: "/assets/sticker-secret.png", label: "Secret" },
  { src: "/assets/sticker-dance.png", label: "Dance" },
  { src: "/assets/sticker-snack.png", label: "Snack" }
];
const INK_COLORS = ["#ed1c2e", "#ffca28", "#52d19b", "#72b7ff", "#ffffff", "#140508"];
const LEAF_COLORS = ["#ffffff", "#f5ebdf", "#ebd5bf", "#fce2db", "#e2ece9", "#dae8f5", "#a21f25", "#5b1317", "#241215", "#1e3a5f"];
const EDITOR_COLOR = "#a21f25";
const STICKER_ASPECT = 1.23;
const MAX_TEXT_LENGTH = 20;
const TEXT_FONTS = [
  { id: "Pacifico", label: "Script", weight: 400 },
  { id: "DM Sans", label: "Bold", weight: 800 },
  { id: "Allura", label: "Elegant", weight: 400 },
  { id: "Bangers", label: "Comic", weight: 400 }
];

const fontSpec = (font, size) => `${TEXT_FONTS.find((f) => f.id === font)?.weight ?? 400} ${size}px "${font}"`;

let measureContext;
function measureText(text, font, fontSize) {
  measureContext = measureContext || document.createElement("canvas").getContext("2d");
  measureContext.font = fontSpec(font, fontSize);
  const width = measureContext.measureText(text || " ").width;
  return { w: Math.max(40, width + fontSize * 0.5), h: fontSize * 1.5 };
}

// Sticker images keep their aspect ratio; text scales its font size and is re-measured.
function resizedItem(item, ratio, start) {
  if (item.kind === "text") {
    const fontSize = Math.max(12, Math.min(200, start.fontSize * ratio));
    return { ...item, fontSize, ...measureText(item.text, item.font, fontSize) };
  }
  const w = Math.max(55, Math.min(230, start.w * ratio));
  return { ...item, w, h: w * STICKER_ASPECT };
}

const luminance = (hex) => {
  const rgb = hex.replace("#", "").match(/.{2}/g).map((value) => parseInt(value, 16) / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};

const contrast = (a, b) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

const controlColors = (leafColor) => {
  const candidates = ["#ffffff", "#111111", "#00e5ff", "#ffe600", "#74ff70"];
  const outline = candidates.reduce((best, color) => Math.min(contrast(color, leafColor), contrast(color, EDITOR_COLOR)) > Math.min(contrast(best, leafColor), contrast(best, EDITOR_COLOR)) ? color : best);
  return { outline, ink: contrast(outline, "#111111") > contrast(outline, "#ffffff") ? "#111111" : "#ffffff" };
};

const BRUSHES = [
  { id: "pen", label: "Pen" },
  { id: "marker", label: "Marker" },
  { id: "highlighter", label: "Highlighter" },
  { id: "spray", label: "Spray" },
  { id: "crayon", label: "Crayon" },
  { id: "calligraphy", label: "Calligraphy" },
  { id: "neon", label: "Neon" }
];

// Translucent brushes look wrong when segments overlap, so they are redrawn as one whole path.
const WHOLE_PATH_BRUSHES = {
  marker: { width: 1.15, alpha: 0.85, cap: "square" },
  highlighter: { width: 2.4, alpha: 0.35, cap: "butt" }
};
const NIB_ANGLE = -Math.PI / 4;

// ---- predefined shapes (unit polygons in [-1, 1], scaled to the dragged box) ----
const regularPolygon = (n, rotation = -Math.PI / 2) =>
  Array.from({ length: n }, (_, k) => [Math.cos(rotation + (2 * Math.PI * k) / n), Math.sin(rotation + (2 * Math.PI * k) / n)]);

const normalizeShape = (points) => {
  const xs = points.map((pt) => pt[0]);
  const ys = points.map((pt) => pt[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return points.map(([x, y]) => [((x - minX) / (maxX - minX)) * 2 - 1, ((y - minY) / (maxY - minY)) * 2 - 1]);
};

const SHAPE_UNIT = {
  circle: regularPolygon(72),
  square: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
  triangle: [[0, -1], [1, 1], [-1, 1]],
  diamond: [[0, -1], [1, 0], [0, 1], [-1, 0]],
  hexagon: regularPolygon(6, 0),
  star: Array.from({ length: 10 }, (_, k) => {
    const radius = k % 2 === 0 ? 1 : 0.42;
    const angle = -Math.PI / 2 + (Math.PI * k) / 5;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  }),
  heart: normalizeShape(Array.from({ length: 120 }, (_, k) => {
    const t = (2 * Math.PI * k) / 120;
    return [16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
  })),
  flower: Array.from({ length: 160 }, (_, k) => {
    const t = (2 * Math.PI * k) / 160;
    const radius = 0.3 + 0.7 * Math.abs(Math.cos(2.5 * t));
    return [Math.cos(t - Math.PI / 2) * radius, Math.sin(t - Math.PI / 2) * radius];
  })
};

const SHAPES = [
  { id: "line", label: "Line" },
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "triangle", label: "Triangle" },
  { id: "diamond", label: "Diamond" },
  { id: "hexagon", label: "Hexagon" },
  { id: "star", label: "Star" },
  { id: "heart", label: "Heart" },
  { id: "flower", label: "Flower" }
];

// ---- mirror / symmetry ----
const SYMMETRIES = [
  { id: "off", label: "Off" },
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
  { id: "diagonal", label: "Leaf axis" },
  { id: "both", label: "4-way" },
  { id: "radial", label: "Radial" },
  { id: "kaleido", label: "Kaleido" }
];
const FALLBACK_GEO = { cx: W / 2, cy: H / 2, theta: -Math.PI / 4 };

// Centre and long axis (the midrib) of the leaf, from its mask.
function computeLeafGeometry(mask) {
  const probe = document.createElement("canvas");
  probe.width = W;
  probe.height = H;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(mask, LEAF_X, 0, LEAF_SIZE, LEAF_SIZE);
  const data = ctx.getImageData(0, 0, W, H).data;
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        n++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
      }
    }
  }
  if (!n) return FALLBACK_GEO;
  const cx = sx / n;
  const cy = sy / n;
  const theta = 0.5 * Math.atan2(2 * (sxy / n - cx * cy), sxx / n - cx * cx - (syy / n - cy * cy));
  return { cx, cy, theta };
}

// Each copy is p' = centre + M (p - centre); M is a rotation or a reflection.
const matrixAt = (geo, a, b, c, d) => ({ cx: geo.cx, cy: geo.cy, a, b, c, d });
const reflectionAbout = (geo, angle) => matrixAt(geo, Math.cos(2 * angle), Math.sin(2 * angle), Math.sin(2 * angle), -Math.cos(2 * angle));
const rotationBy = (geo, angle) => matrixAt(geo, Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle));
const IDENTITY = { cx: 0, cy: 0, a: 1, b: 0, c: 0, d: 1 };

function buildSymmetry(mode, count, geo) {
  const identity = matrixAt(geo, 1, 0, 0, 1);
  if (mode === "vertical") return [identity, reflectionAbout(geo, Math.PI / 2)];
  if (mode === "horizontal") return [identity, reflectionAbout(geo, 0)];
  if (mode === "diagonal") return [identity, reflectionAbout(geo, geo.theta)];
  if (mode === "both") return [identity, reflectionAbout(geo, Math.PI / 2), reflectionAbout(geo, 0), rotationBy(geo, Math.PI)];
  if (mode === "radial") return Array.from({ length: count }, (_, k) => rotationBy(geo, (2 * Math.PI * k) / count));
  if (mode === "kaleido") {
    return Array.from({ length: count }, (_, k) => [rotationBy(geo, (2 * Math.PI * k) / count), reflectionAbout(geo, Math.PI / 2 + (Math.PI * k) / count)]).flat();
  }
  return [identity];
}

const applyPoint = (m, pt) => ({
  x: m.cx + m.a * (pt.x - m.cx) + m.b * (pt.y - m.cy),
  y: m.cy + m.c * (pt.x - m.cx) + m.d * (pt.y - m.cy)
});

function DrawingCanvas({ canvasRef, color, tool, brush, size, shape, shapeFill, mirrorShapes, getCopies, onHistory }) {
  const drawing = useRef(false);
  const last = useRef(null);
  const origin = useRef(null);
  const path = useRef([]);
  const base = useRef(null);
  const copies = useRef([IDENTITY]);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * W) / rect.width,
      y: ((event.clientY - rect.top) * H) / rect.height
    };
  };

  const activeBrush = tool === "eraser" ? "pen" : brush;
  const usesWholePath = tool === "pen" && Boolean(WHOLE_PATH_BRUSHES[activeBrush]);

  const drawWholePath = (ctx, settings) => {
    ctx.putImageData(base.current, 0, 0);
    ctx.save();
    ctx.globalAlpha = settings.alpha;
    ctx.lineCap = settings.cap;
    ctx.lineJoin = settings.cap === "round" ? "round" : "miter";
    ctx.lineWidth = size * settings.width;
    ctx.strokeStyle = color;
    ctx.beginPath(); // one path for every mirrored copy, so overlaps do not stack up opacity
    copies.current.forEach((m) => {
      const points = path.current.map((pt) => applyPoint(m, pt));
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      if (points.length === 1) ctx.lineTo(points[0].x + 0.01, points[0].y);
    });
    ctx.stroke();
    ctx.restore();
  };

  // Walks the segment in small steps and stamps once per step.
  const stamps = (from, to, spacing, stamp) => {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / spacing));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      stamp(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  const drawSegmentOnce = (ctx, from, to, m) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (activeBrush === "spray") {
      const radius = size * 0.9;
      stamps(from, to, Math.max(2, size / 5), (x, y) => {
        for (let i = 0; i < Math.round(size * 0.9) + 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = radius * Math.sqrt(Math.random());
          ctx.globalAlpha = 0.35 + Math.random() * 0.65;
          ctx.beginPath();
          ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 0.5 + Math.random() * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (activeBrush === "crayon") {
      const radius = size * 0.55;
      stamps(from, to, 2, (x, y) => {
        for (let i = 0; i < Math.round(size * 0.7) + 2; i++) {
          if (Math.random() < 0.28) continue; // gaps give the waxy grain
          const angle = Math.random() * Math.PI * 2;
          const dist = radius * Math.sqrt(Math.random());
          const grain = 1.2 + Math.random() * 2;
          ctx.globalAlpha = 0.45 + Math.random() * 0.5;
          ctx.fillRect(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, grain, grain);
        }
      });
    } else if (activeBrush === "calligraphy") {
      const nib = (size * 1.5) / 2;
      const nx = Math.cos(NIB_ANGLE) * nib;
      const ny = Math.sin(NIB_ANGLE) * nib;
      // The nib is mirrored/rotated along with the stroke.
      const dx = m.a * nx + m.b * ny;
      const dy = m.c * nx + m.d * ny;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(from.x + dx, from.y + dy);
      ctx.lineTo(from.x - dx, from.y - dy);
      ctx.lineTo(to.x - dx, to.y - dy);
      ctx.lineTo(to.x + dx, to.y + dy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (activeBrush === "neon") {
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 1.4;
      ctx.lineWidth = Math.max(2, size * 0.55);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = Math.max(1, size * 0.2);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawSegment = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    if (usesWholePath) {
      drawWholePath(ctx, WHOLE_PATH_BRUSHES[activeBrush]);
      return;
    }
    copies.current.forEach((m) => drawSegmentOnce(ctx, applyPoint(m, from), applyPoint(m, to), m));
  };

  // Shapes are previewed live: restore the canvas, then draw the shape (and its mirrors).
  const drawShape = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.putImageData(base.current, 0, 0);
    const a = origin.current;
    const b = last.current;
    let points;
    let closed = true;
    if (shape === "line") {
      points = [a, b];
      closed = false;
    } else {
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      let hx = Math.abs(b.x - a.x) / 2;
      let hy = Math.abs(b.y - a.y) / 2;
      if (hx < 4 && hy < 4) hx = hy = 40; // a plain tap stamps a default-size shape
      points = SHAPE_UNIT[shape].map(([ux, uy]) => ({ x: cx + ux * hx, y: cy + uy * hy }));
    }
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, size * 0.6);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    copies.current.forEach((m) => {
      ctx.beginPath();
      points.forEach((pt, i) => {
        const q = applyPoint(m, pt);
        if (i === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      });
      if (closed) ctx.closePath();
      if (shapeFill && closed) ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  };

  const draw = (event) => {
    if (!drawing.current) return;
    const p = point(event);
    if (tool === "shape") {
      last.current = p;
      drawShape();
      return;
    }
    path.current.push(p);
    drawSegment(last.current, p);
    last.current = p;
  };

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-label="Drawing canvas inside NESCAFÉ leaf"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drawing.current = true;
        copies.current = tool === "shape" && !mirrorShapes ? [IDENTITY] : getCopies();
        const p = point(e);
        last.current = p;
        origin.current = p;
        path.current = [p];
        const needsBase = tool === "shape" || usesWholePath;
        base.current = needsBase ? canvasRef.current.getContext("2d").getImageData(0, 0, W, H) : null;
        if (tool === "shape") drawShape();
        else drawSegment(p, p); // a single tap leaves a mark
      }}
      onPointerMove={draw}
      onPointerUp={() => {
        if (drawing.current) {
          drawing.current = false;
          base.current = null;
          onHistory();
        }
      }}
      onPointerCancel={() => {
        drawing.current = false;
        base.current = null;
      }}
    />
  );
}

function ShapeIcon({ id }) {
  const points = id === "line" ? [[-0.85, 0.85], [0.85, -0.85]] : SHAPE_UNIT[id];
  return (
    <svg className="shape-icon" viewBox="-1.25 -1.25 2.5 2.5" aria-hidden="true">
      <polyline
        points={[...points, ...(id === "line" ? [] : [points[0]])].map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.14"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SymmetryIcon({ id }) {
  const line = (angle, key) => (
    <line key={key} x1={14 - Math.cos(angle) * 12} y1={14 - Math.sin(angle) * 12} x2={14 + Math.cos(angle) * 12} y2={14 + Math.sin(angle) * 12} />
  );
  const axes = {
    off: [],
    vertical: [Math.PI / 2],
    horizontal: [0],
    diagonal: [-Math.PI / 4],
    both: [0, Math.PI / 2],
    radial: [0, Math.PI / 3, (2 * Math.PI) / 3],
    kaleido: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]
  }[id];
  return (
    <svg className="symmetry-icon" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="5" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray={id === "off" ? "3 3" : undefined} />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2.5 2.5">{axes.map((angle, i) => line(angle, i))}</g>
      {id !== "off" && <circle cx="14" cy="14" r="1.8" fill="currentColor" />}
    </svg>
  );
}

function SymmetryGuides({ mode, count, geo }) {
  const reach = 1200;
  const line = (angle, key, ray = false) => {
    const dx = Math.cos(angle) * reach;
    const dy = Math.sin(angle) * reach;
    return <line key={key} x1={ray ? geo.cx : geo.cx - dx} y1={ray ? geo.cy : geo.cy - dy} x2={geo.cx + dx} y2={geo.cy + dy} />;
  };
  let lines = [];
  if (mode === "vertical") lines = [line(Math.PI / 2, "v")];
  else if (mode === "horizontal") lines = [line(0, "h")];
  else if (mode === "diagonal") lines = [line(geo.theta, "d")];
  else if (mode === "both") lines = [line(Math.PI / 2, "v"), line(0, "h")];
  else if (mode === "radial") lines = Array.from({ length: count }, (_, k) => line(-Math.PI / 2 + (2 * Math.PI * k) / count, k, true));
  else if (mode === "kaleido") lines = Array.from({ length: count }, (_, k) => line(Math.PI / 2 + (Math.PI * k) / count, k));
  return (
    <svg className="symmetry-guides" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <g>{lines}</g>
      <circle cx={geo.cx} cy={geo.cy} r="4" />
    </svg>
  );
}

function BrushSample({ id }) {
  const wave = "M6 16 C 18 2, 30 2, 40 12 S 62 22, 74 8";
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg className="brush-sample" viewBox="0 0 80 24" aria-hidden="true">
      {id === "pen" && <path d={wave} {...common} strokeWidth="3" />}
      {id === "marker" && <path d={wave} {...common} strokeWidth="5" strokeLinecap="square" opacity=".85" />}
      {id === "highlighter" && <path d={wave} {...common} strokeWidth="10" strokeLinecap="butt" opacity=".4" />}
      {id === "spray" && <path d={wave} {...common} strokeWidth="7" strokeDasharray="0.1 3.4" />}
      {id === "crayon" && <path d={wave} {...common} strokeWidth="6" strokeDasharray="2 1.5 0.5 2" opacity=".85" />}
      {id === "calligraphy" && <path d={wave} {...common} strokeWidth="5" strokeLinecap="butt" />}
      {id === "neon" && (
        <>
          <path d={wave} {...common} strokeWidth="7" opacity=".35" />
          <path d={wave} {...common} strokeWidth="3.5" opacity=".7" />
          <path d={wave} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function hexToHsv(hex) {
  const value = parseInt(hex.slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const to = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(f(5))}${to(f(3))}${to(f(1))}`;
}

// Always-open custom color picker: saturation/value square, hue slider and hex field.
function ColorPanel({ value, onChange, label, compact = false }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [hexText, setHexText] = useState(value);
  const areaRef = useRef(null);

  // Follow outside changes (swatch clicks) without losing the hue of grey/black/white.
  useEffect(() => {
    if (hsvToHex(hsv).toLowerCase() !== value.toLowerCase()) {
      setHsv(hexToHsv(value));
    }
    setHexText(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (next) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const pickFromPointer = (event) => {
    const rect = areaRef.current.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const v = 1 - Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    update({ ...hsv, s, v });
  };

  return (
    <div className={compact ? "color-panel compact" : "color-panel"} role="group" aria-label={label}>
      <div
        ref={areaRef}
        className="color-panel-area"
        style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pickFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) pickFromPointer(event);
        }}
      >
        <span
          className="color-panel-handle"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: value }}
        />
      </div>
      <div className="color-panel-side">
        <input
          className="color-panel-hue"
          type="range"
          min="0"
          max="359"
          value={Math.round(hsv.h)}
          onChange={(event) => update({ ...hsv, h: +event.target.value })}
          aria-label={`${label} hue`}
        />
        <div className="color-panel-hex">
          <span className="color-panel-preview" style={{ backgroundColor: value }} />
          <input
            type="text"
            value={hexText}
            maxLength={7}
            spellCheck={false}
            onChange={(event) => {
              const text = event.target.value;
              setHexText(text);
              if (/^#[0-9a-fA-F]{6}$/.test(text)) {
                setHsv(hexToHsv(text));
                onChange(text.toLowerCase());
              }
            }}
            onBlur={() => setHexText(value)}
            aria-label={`${label} hex code`}
          />
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const canvasShellRef = useRef(null);
  const leafRef = useRef(null);
  const outlineRef = useRef(null);
  const historyRef = useRef({ stack: [], index: -1 });
  const commitTimerRef = useRef(null);
  const restoreTokenRef = useRef(0);
  const [historyTick, setHistoryTick] = useState(0);
  const [color, setColor] = useState(INK_COLORS[0]);
  const [leafColor, setLeafColor] = useState("#ffffff");
  const [tool, setTool] = useState("pen");
  const [brush, setBrush] = useState("pen");
  const [toolTab, setToolTab] = useState("brushes");
  const [shape, setShape] = useState("circle");
  const [shapeFill, setShapeFill] = useState(false);
  const [mirrorShapes, setMirrorShapes] = useState(true);
  const [symmetry, setSymmetry] = useState("off");
  const [symmetryCount, setSymmetryCount] = useState(6);
  const [leafGeo, setLeafGeo] = useState(null);
  const [size, setSize] = useState(18);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sentMessage, setSentMessage] = useState(false);
  const successTimerRef = useRef(null);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: "clear" } | { type: "sticker", id }
  const [dragPreview, setDragPreview] = useState(null);
  const trayDragRef = useRef(null);
  const stickerGestureRef = useRef({ id: null, pointers: new Map(), lastX: 0, lastY: 0, startDistance: 0, start: { w: 112, fontSize: 30 } });
  const transformHandleRef = useRef(null);
  const textInputRef = useRef(null);
  const justAddedTextRef = useRef(null);
  const previousSelectionRef = useRef(null);

  useEffect(() => {
    const mask = leafRef.current;
    if (!mask) return undefined;
    const compute = () => setLeafGeo(computeLeafGeometry(mask));
    if (mask.complete && mask.naturalWidth) compute();
    else mask.addEventListener("load", compute, { once: true });
    return () => mask.removeEventListener("load", compute);
  }, []);

  const symmetryRef = useRef({});
  symmetryRef.current = { mode: symmetry, count: symmetryCount, geo: leafGeo || FALLBACK_GEO };
  const getCopies = () => buildSymmetry(symmetryRef.current.mode, symmetryRef.current.count, symmetryRef.current.geo);

  // Mirrors of state so history commits always see the latest values.
  const stickersRef = useRef(placedStickers);
  const leafColorRef = useRef(leafColor);
  stickersRef.current = placedStickers;
  leafColorRef.current = leafColor;

  // One history entry = drawing + doodles/text + leaf color. `canvasChanged` is true after a stroke or clear.
  const commit = useCallback((canvasChanged = false) => {
    clearTimeout(commitTimerRef.current);
    commitTimerRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stickers = stickersRef.current;
    const leaf = leafColorRef.current;
    const key = JSON.stringify([stickers, leaf]);
    const history = historyRef.current;
    const current = history.stack[history.index];
    if (current && current.key === key && !canvasChanged) return;
    const entry = { canvas: canvas.toDataURL(), key, stickers, leafColor: leaf };
    history.stack = [...history.stack.slice(0, history.index + 1), entry].slice(-40);
    history.index = history.stack.length - 1;
    setHistoryTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!historyRef.current.stack.length) commit(true); // first entry (guards against dev double-invoke)
  }, [commit]);

  // Doodle, text and leaf-color changes settle into one entry after a short pause.
  useEffect(() => {
    clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => commit(false), 400);
    return () => clearTimeout(commitTimerRef.current);
  }, [placedStickers, leafColor, commit]);

  const applySnapshot = (entry) => {
    const token = ++restoreTokenRef.current;
    const img = new Image();
    img.onload = () => {
      if (token !== restoreTokenRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);
    };
    img.src = entry.canvas;
    stickersRef.current = entry.stickers;
    leafColorRef.current = entry.leafColor;
    setPlacedStickers(entry.stickers);
    setLeafColor(entry.leafColor);
    setSelectedStickerId((id) => (entry.stickers.some((item) => item.id === id) ? id : null));
  };

  const undo = () => {
    if (commitTimerRef.current) commit(false); // include a change that is still settling
    const history = historyRef.current;
    if (history.index <= 0) return;
    history.index -= 1;
    applySnapshot(history.stack[history.index]);
    setHistoryTick((tick) => tick + 1);
  };

  const redo = () => {
    const history = historyRef.current;
    if (history.index >= history.stack.length - 1) return;
    history.index += 1;
    applySnapshot(history.stack[history.index]);
    setHistoryTick((tick) => tick + 1);
  };

  const canUndo = historyRef.current.index > 0;
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1;

  const clear = () => {
    canvasRef.current.getContext("2d").clearRect(0, 0, W, H);
    stickersRef.current = [];
    setPlacedStickers([]);
    setSelectedStickerId(null);
    commit(true);
  };

  const deleteSticker = (id, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setPlacedStickers((items) => items.filter((item) => item.id !== id));
    setSelectedStickerId(null);
  };

  const requestDeleteSticker = (id, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setPendingDelete({ type: "sticker", id });
  };

  const handleConfirmDelete = () => {
    if (pendingDelete?.type === "clear") clear();
    else if (pendingDelete?.type === "sticker") deleteSticker(pendingDelete.id);
    setPendingDelete(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPendingDelete(null);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        const key = e.key.toLowerCase();
        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
        if (key === "y") {
          e.preventDefault();
          redo();
          return;
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedStickerId && !pendingDelete) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setPendingDelete({ type: "sticker", id: selectedStickerId });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStickerId, pendingDelete]);

  useEffect(() => {
    const previous = previousSelectionRef.current;
    previousSelectionRef.current = selectedStickerId;
    if (previous && previous !== selectedStickerId) {
      setPlacedStickers((items) => items.filter((item) => !(item.id === previous && item.kind === "text" && !item.text.trim())));
    }
    if (selectedStickerId && justAddedTextRef.current === selectedStickerId) {
      justAddedTextRef.current = null;
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }
  }, [selectedStickerId]);

  const addSticker = (sticker, x, y) => {
    const id = crypto.randomUUID();
    setPlacedStickers((items) => [...items, {
      id, src: sticker.src, label: sticker.label,
      x, y, w: 112, h: 138, rotation: 0
    }]);
    setSelectedStickerId(id);
  };

  const remeasureAfterFont = (id, font) => {
    if (!document.fonts?.load) return;
    document.fonts.load(fontSpec(font, 48)).then(() => {
      setPlacedStickers((items) => items.map((item) => (
        item.id === id && item.kind === "text" ? { ...item, ...measureText(item.text, item.font, item.fontSize) } : item
      )));
    });
  };

  // The leaf is slanted, so its middle is not the middle of the canvas: find it from the mask.
  const leafCenterSpot = () => {
    const fallback = { x: W / 2, y: H / 2, span: LEAF_SIZE * 0.5 };
    const mask = leafRef.current;
    if (!mask?.complete || !mask.naturalWidth) return fallback;
    const probe = document.createElement("canvas");
    probe.width = W;
    probe.height = H;
    const ctx = probe.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(mask, LEAF_X, 0, LEAF_SIZE, LEAF_SIZE);
    const data = ctx.getImageData(0, 0, W, H).data;
    let sumY = 0;
    let count = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          sumY += y;
          count++;
        }
      }
    }
    if (!count) return fallback;
    const cy = Math.round(sumY / count);
    let first = -1;
    let last = -1;
    for (let x = 0; x < W; x++) {
      if (data[(cy * W + x) * 4 + 3] > 128) {
        if (first < 0) first = x;
        last = x;
      }
    }
    return first < 0 ? fallback : { x: (first + last) / 2, y: cy, span: last - first };
  };

  const addText = () => {
    const id = crypto.randomUUID();
    const spot = leafCenterSpot();
    const text = "Your text";
    const font = "Pacifico";
    // Start at 30, but shrink if the leaf is narrower than the text at this row.
    const fit = (spot.span * 0.8) / measureText(text, font, 30).w;
    const fontSize = Math.max(12, Math.min(30, 30 * fit));
    const item = { id, kind: "text", text, font, color, fontSize, x: spot.x, y: spot.y, rotation: 0 };
    setPlacedStickers((items) => [...items, { ...item, ...measureText(item.text, item.font, item.fontSize) }]);
    justAddedTextRef.current = id;
    setSelectedStickerId(id);
    remeasureAfterFont(id, item.font);
  };

  const updateText = (patch) => {
    const id = selectedStickerId;
    setPlacedStickers((items) => items.map((item) => {
      if (item.id !== id || item.kind !== "text") return item;
      const next = { ...item, ...patch };
      return { ...next, ...measureText(next.text, next.font, next.fontSize) };
    }));
    if (patch.font) remeasureAfterFont(id, patch.font);
  };

  const dropSticker = (sticker, point) => {
    const shell = canvasShellRef.current;
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    if (point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom) return;
    addSticker(sticker, ((point.x - rect.left) * W) / rect.width, ((point.y - rect.top) * H) / rect.height);
  };

  const startTrayDrag = (sticker, event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    trayDragRef.current = sticker;
    setDragPreview({ sticker, x: event.clientX, y: event.clientY });
  };

  const moveTrayDrag = (event) => {
    if (!trayDragRef.current) return;
    setDragPreview({ sticker: trayDragRef.current, x: event.clientX, y: event.clientY });
  };

  const endTrayDrag = (event) => {
    if (!trayDragRef.current) return;
    dropSticker(trayDragRef.current, { x: event.clientX, y: event.clientY });
    trayDragRef.current = null;
    setDragPreview(null);
  };

  const startPlacedDrag = (id, event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedStickerId(id);
    const gesture = stickerGestureRef.current;
    if (gesture.id !== id) gesture.pointers.clear();
    gesture.id = id;
    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (gesture.pointers.size === 1) {
      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;
    } else if (gesture.pointers.size === 2) {
      const [a, b] = [...gesture.pointers.values()];
      gesture.startDistance = Math.hypot(b.x - a.x, b.y - a.y);
      const item = placedStickers.find((entry) => entry.id === id);
      gesture.start = { w: item?.w || 112, fontSize: item?.fontSize || 30 };
    }
  };

  const movePlacedDrag = (event) => {
    const active = stickerGestureRef.current;
    const shell = canvasShellRef.current;
    if (!active.id || !active.pointers.has(event.pointerId) || !shell) return;
    active.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const rect = shell.getBoundingClientRect();
    if (active.pointers.size >= 2) {
      const [a, b] = [...active.pointers.values()];
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const ratio = distance / Math.max(1, active.startDistance);
      setPlacedStickers((items) => items.map((item) => item.id === active.id ? resizedItem(item, ratio, active.start) : item));
    } else {
      const dx = ((event.clientX - active.lastX) * W) / rect.width;
      const dy = ((event.clientY - active.lastY) * H) / rect.height;
      active.lastX = event.clientX;
      active.lastY = event.clientY;
      setPlacedStickers((items) => items.map((item) => item.id === active.id ? {
        ...item,
        x: Math.max(LEAF_X, Math.min(W - LEAF_X, item.x + dx)),
        y: Math.max(0, Math.min(H, item.y + dy))
      } : item));
    }
  };

  const endPlacedDrag = (event) => {
    const gesture = stickerGestureRef.current;
    gesture.pointers.delete(event.pointerId);
    if (gesture.pointers.size === 1) {
      const remaining = [...gesture.pointers.values()][0];
      gesture.lastX = remaining.x;
      gesture.lastY = remaining.y;
    } else if (gesture.pointers.size === 0) {
      gesture.id = null;
    }
  };

  const stickerCenterOnScreen = (item) => {
    const rect = canvasShellRef.current.getBoundingClientRect();
    return { x: rect.left + (item.x / W) * rect.width, y: rect.top + (item.y / H) * rect.height };
  };

  const startResizeHandle = (item, event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const center = stickerCenterOnScreen(item);
    transformHandleRef.current = { type: "resize", id: item.id, center, start: { w: item.w, fontSize: item.fontSize }, startDistance: Math.max(1, Math.hypot(event.clientX - center.x, event.clientY - center.y)) };
  };

  const startRotateHandle = (item, event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const center = stickerCenterOnScreen(item);
    transformHandleRef.current = { type: "rotate", id: item.id, center, startRotation: item.rotation, startAngle: Math.atan2(event.clientY - center.y, event.clientX - center.x) };
  };

  const moveTransformHandle = (event) => {
    const active = transformHandleRef.current;
    if (!active) return;
    if (active.type === "resize") {
      const distance = Math.hypot(event.clientX - active.center.x, event.clientY - active.center.y);
      const ratio = distance / active.startDistance;
      setPlacedStickers((items) => items.map((item) => item.id === active.id ? resizedItem(item, ratio, active.start) : item));
    } else {
      const angle = Math.atan2(event.clientY - active.center.y, event.clientX - active.center.x);
      const rotation = active.startRotation + ((angle - active.startAngle) * 180) / Math.PI;
      setPlacedStickers((items) => items.map((item) => item.id === active.id ? { ...item, rotation } : item));
    }
  };

  const endTransformHandle = () => {
    transformHandleRef.current = null;
  };

  const loadStickerImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const clean = document.createElement("canvas");
      clean.width = img.width;
      clean.height = img.height;
      const ctx = clean.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, clean.width, clean.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        if (pixels.data[i] > 245 && pixels.data[i + 1] > 245 && pixels.data[i + 2] > 245) pixels.data[i + 3] = 0;
      }
      ctx.putImageData(pixels, 0, 0);
      resolve(clean);
    };
    img.src = src;
  });

  const createSavedDesign = async () => {
    const mask = leafRef.current;
    const strokes = document.createElement("canvas");
    strokes.width = W;
    strokes.height = H;
    const strokesCtx = strokes.getContext("2d");
    strokesCtx.drawImage(canvasRef.current, 0, 0);
    strokesCtx.globalCompositeOperation = "destination-in";
    strokesCtx.drawImage(mask, LEAF_X, 0, LEAF_SIZE, LEAF_SIZE);

    const output = document.createElement("canvas");
    output.width = W;
    output.height = H;
    const outputCtx = output.getContext("2d");
    outputCtx.fillStyle = leafColor;
    outputCtx.fillRect(0, 0, W, H);
    outputCtx.globalCompositeOperation = "destination-in";
    outputCtx.drawImage(mask, LEAF_X, 0, LEAF_SIZE, LEAF_SIZE);
    outputCtx.globalCompositeOperation = "source-over";
    outputCtx.drawImage(strokes, 0, 0);
    const stickerImages = await Promise.all(placedStickers.map((item) => (
      item.kind === "text" ? document.fonts.load(fontSpec(item.font, item.fontSize), item.text) : loadStickerImage(item.src)
    )));
    placedStickers.forEach((item, index) => {
      outputCtx.save();
      outputCtx.translate(item.x, item.y);
      outputCtx.rotate((item.rotation * Math.PI) / 180);
      if (item.kind === "text") {
        outputCtx.font = fontSpec(item.font, item.fontSize);
        outputCtx.fillStyle = item.color;
        outputCtx.textAlign = "center";
        outputCtx.textBaseline = "middle";
        outputCtx.fillText(item.text, 0, 0);
      } else {
        outputCtx.drawImage(stickerImages[index], -item.w / 2, -item.h / 2, item.w, item.h);
      }
      outputCtx.restore();
    });
    outputCtx.globalCompositeOperation = "destination-in";
    outputCtx.drawImage(mask, LEAF_X, 0, LEAF_SIZE, LEAF_SIZE);
    outputCtx.globalCompositeOperation = "source-over";
    return output.toDataURL("image/png");
  };

  const resetEditor = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, W, H);
    }
    setPlacedStickers([]);
    setSelectedStickerId(null);
    setLeafColor("#ffffff");
    setColor(INK_COLORS[0]);
    setTool("pen");
    setSize(18);
    clearTimeout(commitTimerRef.current);
    commitTimerRef.current = null;
    stickersRef.current = [];
    leafColorRef.current = "#ffffff";
    historyRef.current = { stack: [], index: -1 };
    commit(true);
  };

  const handleDismissSuccess = () => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setSentMessage(false);
    setSending(false);
  };

  const handleOpenConfirm = () => {
    if (sending || sentMessage) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirm(false);
    setSending(true);
    try {
      const image = await createSavedDesign();
      const blob = await fetch(image).then((response) => response.blob());
      const formData = new FormData();
      formData.append("image", blob, `nescafe-${Date.now()}.png`);
      const response = await fetch("/api/designs", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your design");

      // Clear canvas and reset editor state without refreshing the page
      resetEditor();
      setSentMessage(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        handleDismissSuccess();
      }, 5000);
    } catch (error) {
      window.alert(error.message || "Unable to send your design. Please try again.");
      setSending(false);
    }
  };

  const selectedSticker = placedStickers.find((item) => item.id === selectedStickerId);
  const transformColors = controlColors(leafColor);

  return (
    <motion.main
      className="editor screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="editor-head">
        <div className="editor-ribbon">
          <button className="nav-back" onClick={() => router.push("/")} aria-label="Back to home page">
            <ArrowLeft /> <span>BACK</span>
          </button>
          <strong>LET&apos;S MAKE YOUR WORLD</strong>
          <img src="/assets/nescafe-logo-trimmed.png" alt="NESCAFÉ — Make your world" />
        </div>
      </header>

      <section className="editor-grid">
        <div className="toolbox-spacer" aria-hidden="true" />

        <div className="studio">
          <div ref={canvasShellRef} className="canvas-shell" onPointerDownCapture={(event) => {if(event.target.tagName === "CANVAS") setSelectedStickerId(null)}}>
            <img ref={leafRef} className="leaf-mask-source" src="/assets/nescafe-leaf.png" alt="" />
            <div className="leaf-image" style={{ backgroundColor: leafColor }} role="img" aria-label="NESCAFÉ leaf drawing canvas" />
            <DrawingCanvas canvasRef={canvasRef} color={color} tool={tool} brush={brush} size={size} shape={shape} shapeFill={shapeFill} mirrorShapes={mirrorShapes} getCopies={getCopies} onHistory={() => commit(true)} />
            <div className="placed-stickers" style={{ "--selection-color": transformColors.outline, "--selection-ink": transformColors.ink }}>
              {placedStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className={`placed-sticker${selectedStickerId === sticker.id ? " selected" : ""}`}
                  onPointerDown={(event) => startPlacedDrag(sticker.id, event)}
                  onPointerMove={movePlacedDrag}
                  onPointerUp={endPlacedDrag}
                  onPointerCancel={endPlacedDrag}
                  style={{ left: `${(sticker.x / W) * 100}%`, top: `${(sticker.y / H) * 100}%`, width: `${(sticker.w / W) * 100}%`, height: `${(sticker.h / H) * 100}%`, transform: `translate(-50%,-50%) rotate(${sticker.rotation}deg)` }}
                >
                  {sticker.kind === "text" ? (
                    <span
                      className="placed-text"
                      style={{ fontFamily: `"${sticker.font}"`, fontWeight: TEXT_FONTS.find((f) => f.id === sticker.font)?.weight ?? 400, color: sticker.color, fontSize: `${(sticker.fontSize / W) * 100}cqw` }}
                    >
                      {sticker.text}
                    </span>
                  ) : (
                    <img src={sticker.src} alt={sticker.label} />
                  )}
                  {selectedStickerId === sticker.id && (
                    <>
                      {['nw','ne','sw','se'].map((corner) => <button key={corner} className={`transform-handle resize-handle ${corner}`} onPointerDown={(event)=>startResizeHandle(sticker,event)} onPointerMove={moveTransformHandle} onPointerUp={endTransformHandle} onPointerCancel={endTransformHandle} aria-label="Resize" />)}
                      <span className="rotate-stem" />
                      <span className="rotate-bridge" />
                      <button
                        type="button"
                        className="transform-handle rotate-handle"
                        onPointerDown={(event) => startRotateHandle(sticker, event)}
                        onPointerMove={moveTransformHandle}
                        onPointerUp={endTransformHandle}
                        onPointerCancel={endTransformHandle}
                        aria-label="Rotate doodle"
                        title="Rotate doodle"
                      >
                        <ArrowClockwise weight="bold" />
                      </button>
                      <button
                        type="button"
                        className="transform-handle delete-handle"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => requestDeleteSticker(sticker.id, event)}
                        aria-label="Delete doodle"
                        title="Delete doodle"
                      >
                        <X weight="bold" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <img ref={outlineRef} className="leaf-dotted-outline" src="/assets/leaf-outline.svg" alt="" aria-hidden="true" />
            {symmetry !== "off" && <SymmetryGuides mode={symmetry} count={symmetryCount} geo={leafGeo || FALLBACK_GEO} />}
            <span className="canvas-hint">YOUR WORLD STARTS HERE</span>
          </div>
        </div>

        <aside className="stickers">
          <span>DROP A DOODLE</span>
          <div>
            {STICKERS.map((s) => (
              <motion.button
                key={s.src}
                onPointerDown={(event) => startTrayDrag(s, event)}
                onPointerMove={moveTrayDrag}
                onPointerUp={endTrayDrag}
                onPointerCancel={endTrayDrag}
                whileHover={{ scale: 1.06, rotate: -2 }}
                aria-label={`Drag ${s.label} onto the leaf`}
              >
                <img src={s.src} alt={s.label} />
              </motion.button>
            ))}
          </div>
        </aside>
      </section>

      {dragPreview && (
        <div className="sticker-drag-preview" style={{ left: dragPreview.x, top: dragPreview.y }}>
          <img src={dragPreview.sticker.src} alt="" />
        </div>
      )}

      {/* Tools + brushes: pinned to the left edge, aligned with the INK card below */}
      <aside className={`toolbox${selectedSticker?.kind === "text" ? " text-editing" : ""}`}>
        <span className="tool-card-title">DRAW TOOLS</span>
        <div className="tool-row">
        <button className={tool === "pen" ? "active" : ""} onClick={() => setTool("pen")} aria-label="Pen">
          <PencilSimple />
        </button>
        <button className={tool === "eraser" ? "active" : ""} onClick={() => setTool("eraser")} aria-label="Eraser">
          <Eraser />
        </button>
        <button onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
          <ArrowCounterClockwise />
        </button>
        <button onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Y)">
          <ArrowClockwise />
        </button>
        <button onClick={() => setPendingDelete({ type: "clear" })} aria-label="Clear">
          <Trash />
        </button>
        </div>

          <button type="button" className="add-text-btn" onClick={addText}>
            <TextT weight="bold" size={14} />
            <span>ADD TEXT</span>
          </button>

          {selectedSticker?.kind === "text" && (
            <div className="text-section">
              <input
                ref={textInputRef}
                className="text-input"
                type="text"
                value={selectedSticker.text}
                maxLength={MAX_TEXT_LENGTH}
                placeholder="Type here"
                spellCheck={false}
                onChange={(event) => updateText({ text: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSelectedStickerId(null);
                }}
                aria-label="Text on the leaf"
              />
              <div className="text-fonts" role="radiogroup" aria-label="Text font">
                {TEXT_FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedSticker.font === f.id}
                    title={f.label}
                    className={selectedSticker.font === f.id ? "text-font selected" : "text-font"}
                    style={{ fontFamily: `"${f.id}"`, fontWeight: f.weight }}
                    onClick={() => updateText({ font: f.id })}
                  >
                    Aa
                  </button>
                ))}
              </div>
              <div className="text-colors">
                {INK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={selectedSticker.color === c ? "swatch selected" : "swatch"}
                    style={{ background: c }}
                    aria-label={`Text color ${c}`}
                    onClick={() => updateText({ color: c })}
                  />
                ))}
              </div>
              <ColorPanel compact value={selectedSticker.color} onChange={(next) => updateText({ color: next })} label="Text color" />
            </div>
          )}

          <div className="tool-panel">
          <div className="tool-tabs" role="tablist" aria-label="Drawing options">
            {[["brushes", "Brush", PaintBrush], ["shapes", "Shapes", Shapes], ["symmetry", "Mirror", FlipHorizontal]].map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={toolTab === id}
                title={label}
                className={toolTab === id ? "tool-tab selected" : "tool-tab"}
                onClick={() => setToolTab(id)}
              >
                <Icon weight="bold" size={14} />
                <span>{label}</span>
                {id === "symmetry" && symmetry !== "off" && <i className="tab-dot" />}
              </button>
            ))}
          </div>

          {toolTab === "brushes" && (
            <div className="brush-card" role="radiogroup" aria-label="Brush style">
              <div className="brush-grid">
                {BRUSHES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={brush === b.id}
                    title={b.label}
                    className={`brush-tile${brush === b.id ? (tool === "pen" ? " selected" : " current") : ""}`}
                    onClick={() => {
                      setBrush(b.id);
                      setTool("pen");
                    }}
                  >
                    <BrushSample id={b.id} />
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {toolTab === "shapes" && (
            <div className="shape-card">
              <div className="shape-grid" role="radiogroup" aria-label="Shape">
                {SHAPES.map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    role="radio"
                    aria-checked={tool === "shape" && shape === sh.id}
                    title={sh.label}
                    className={`shape-tile${tool === "shape" && shape === sh.id ? " selected" : ""}`}
                    onClick={() => {
                      setShape(sh.id);
                      setTool("shape");
                    }}
                  >
                    <ShapeIcon id={sh.id} />
                  </button>
                ))}
              </div>
              <div className="shape-fill" role="radiogroup" aria-label="Shape style">
                <button type="button" role="radio" aria-checked={!shapeFill} className={!shapeFill ? "selected" : ""} onClick={() => setShapeFill(false)}>OUTLINE</button>
                <button type="button" role="radio" aria-checked={shapeFill} className={shapeFill ? "selected" : ""} onClick={() => setShapeFill(true)}>FILLED</button>
              </div>
              <div className="shape-fill" role="radiogroup" aria-label="Shapes in mirror mode">
                <button type="button" role="radio" aria-checked={mirrorShapes} className={mirrorShapes ? "selected" : ""} onClick={() => setMirrorShapes(true)}>MIRRORED</button>
                <button type="button" role="radio" aria-checked={!mirrorShapes} className={!mirrorShapes ? "selected" : ""} onClick={() => setMirrorShapes(false)}>SINGLE</button>
              </div>
              <p className="tool-hint">Drag on the leaf to draw. With Mirror on, choose whether shapes are mirrored or drawn just once.</p>
            </div>
          )}

          {toolTab === "symmetry" && (
            <div className="symmetry-card">
              <div className="symmetry-grid" role="radiogroup" aria-label="Mirror mode">
                {SYMMETRIES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={symmetry === m.id}
                    title={m.label}
                    className={symmetry === m.id ? "symmetry-tile selected" : "symmetry-tile"}
                    onClick={() => setSymmetry(m.id)}
                  >
                    <SymmetryIcon id={m.id} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
              {(symmetry === "radial" || symmetry === "kaleido") && (
                <div className="symmetry-count">
                  <span>SECTIONS</span>
                  <button type="button" onClick={() => setSymmetryCount((n) => Math.max(2, n - 1))} aria-label="Fewer sections">-</button>
                  <b>{symmetryCount}</b>
                  <button type="button" onClick={() => setSymmetryCount((n) => Math.min(12, n + 1))} aria-label="More sections">+</button>
                </div>
              )}
              <p className="tool-hint">Draw once, and every stroke is copied around the leaf.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom Controls Bar with Both Color Sections */}
      <div className="editor-controls-bar">
        {/* Left Section: Pen Ink Color Palette & Stroke */}
        <div className="control-dock ink-stroke-dock">
          <ColorPanel
            value={color}
            onChange={(next) => {
              setColor(next);
              setTool("pen");
            }}
            label="Ink color"
          />

          <div className="dock-row">
          {/* Ink color section */}
          <div className="ink-side-column">
            <div className="dock-color-section">
              {/* Pill with Palette icon and Current Color dot */}
              <div className="color-plate-pill">
                {/* Current color dot (Display only, not clickable) */}
                <span
                  className="active-color-dot"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              </div>

              {/* Auto-visible ink color swatches */}
              <div className="swatch-group auto-visible-swatches">
                {INK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setTool("pen");
                    }}
                    className={color === c ? "swatch selected" : "swatch"}
                    style={{ background: c }}
                    aria-label={`Use ink color ${c}`}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Ink text and pen icon placed below the ink color section */}
            <div className="dock-sub-label">
              <PenNib size={12} weight="fill" className="sub-icon" />
              <span>INK</span>
            </div>
          </div>

          <div className="dock-divider" />

          {/* Stroke section moved to INK side */}
          <div className="stroke-side-column">
            <div className="stroke-control-wrap">
              <label className="stroke-slider" title="Adjust stroke size">
                <input
                  type="range"
                  min="4"
                  max="42"
                  value={size}
                  onChange={(e) => setSize(+e.target.value)}
                />
                <b style={{ width: Math.max(5, size / 1.7), height: Math.max(5, size / 1.7) }} />
              </label>
            </div>
            <div className="dock-sub-label stroke-sub-label">
              <PaintBrush size={12} weight="fill" className="sub-icon" />
              <span>STROKE</span>
            </div>
          </div>
          </div>
        </div>

        {/* Right Section: Logo Background Color */}
        <div className="control-dock logo-dock">
          <ColorPanel value={leafColor} onChange={setLeafColor} label="Logo color" />

          <div className="dock-row">
          <div className="logo-side-column">
            <div className="dock-color-section">
              {/* Logo Pill with same Palette Button and Current Logo Color dot */}
              <div className="color-plate-pill">
                {/* Current logo color dot (Display only, not clickable) */}
                <span
                  className="active-color-dot"
                  style={{ backgroundColor: leafColor }}
                  aria-hidden="true"
                />
              </div>

              {/* Auto-visible logo color swatches */}
              <div className="swatch-group auto-visible-swatches">
                {LEAF_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setLeafColor(c)}
                    className={leafColor === c ? "swatch selected" : "swatch"}
                    style={{ background: c }}
                    aria-label={`Use logo color ${c}`}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Replaced icons with "LOGO" text */}
            <div className="dock-sub-label" title="Logo canvas background">
              <span>LOGO</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <button
        className="send-btn"
        onClick={handleOpenConfirm}
        disabled={sending || sentMessage}
      >
        <span>
          {sending ? "LAUNCHING..." : sentMessage ? "LAUNCHED!" : "SEND TO THE WORLD"}
        </span>
        <PaperPlaneTilt weight="fill" />
      </button>

      {/* NESCAFÉ Themed Confirm & Success Modals */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setPendingDelete(null)}
          >
            <motion.div
              className="nescafe-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPendingDelete(null)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>

              <h3 id="delete-dialog-title" className="modal-title-pacifico">
                {pendingDelete.type === "clear" ? "Clear Everything?" : "Delete Doodle?"}
              </h3>
              <p className="modal-subtitle">
                {pendingDelete.type === "clear"
                  ? "This will erase your drawing and remove every doodle from the leaf."
                  : "This doodle will be removed from your leaf."}
              </p>

              <div className="nescafe-modal-actions">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  autoFocus
                  onClick={() => setPendingDelete(null)}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  className="modal-btn-confirm"
                  onClick={handleConfirmDelete}
                >
                  <span>{pendingDelete.type === "clear" ? "YES, CLEAR" : "YES, DELETE"}</span>
                  <Trash weight="fill" size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showConfirm && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !sending && setShowConfirm(false)}
          >
            <motion.div
              className="nescafe-modal"
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowConfirm(false)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>

              <h3 className="modal-title-pacifico">Make Your World</h3>
              <p className="modal-subtitle">
                Ready to send your creation into the world? It will take flight across the Earth globe for everyone to see.
              </p>

              <div className="nescafe-modal-actions">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setShowConfirm(false)}
                >
                  KEEP EDITING
                </button>
                <button
                  type="button"
                  className="modal-btn-confirm"
                  onClick={handleConfirmSend}
                >
                  <span>SEND NOW</span>
                  <PaperPlaneTilt weight="fill" size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {sentMessage && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismissSuccess}
          >
            <motion.div
              className="nescafe-modal"
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleDismissSuccess}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>

              <h3 className="modal-title-pacifico">Flown to the World!</h3>
              <p className="modal-subtitle">
                Your design is now orbiting high above the Earth. Canvas is cleared and ready for your next creation!
              </p>

              <div className="nescafe-modal-actions" style={{ justifyContent: "center" }}>
                <button
                  type="button"
                  className="modal-btn-confirm"
                  onClick={handleDismissSuccess}
                  style={{ minWidth: "150px", flex: "initial" }}
                >
                  <span>OK</span>
                  <CheckCircle weight="bold" size={17} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
