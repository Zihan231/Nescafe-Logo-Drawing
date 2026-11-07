"use client";

import { useEffect, useRef, useState } from "react";

// Validated pair (scripts/validate_palette.js, light, on white): CVD ΔE 26, normal-vision ΔE 34, both >= 3:1 contrast.
export const SERIES_COLORS = { designs: "#d6202b", registrations: "#2a78d6" };

// Axis top split into 4 round steps (1, 2, 2.5 or 5 times a power of ten), so every gridline is a whole number.
function niceAxis(value) {
  const raw = Math.max(1, value) / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw && Number.isInteger(s)) || Math.ceil(raw);
  return step * 4;
}

// The element's width in pixels, so the chart is drawn at its real size and its text never shrinks.
function useWidth(fallback) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

function DataTable({ columns, rows }) {
  return (
    <details className="admin-chart-table">
      <summary>Show as table</summary>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>{columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// Columns over a category axis (days, hours), one or two series side by side, with a hover tooltip per column.
export function ColumnChart({ data, xKey, xLabel = (value) => value, xTick = xLabel, series, height = 220, tickEvery = 1 }) {
  const [hover, setHover] = useState(null);
  const [plotRef, width] = useWidth(640);
  const pad = { top: 12, right: 8, bottom: 28, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = niceAxis(Math.max(...data.flatMap((row) => series.map((s) => row[s.key] || 0))));
  // label fewer columns when they are narrow, so axis labels never collide
  const every = Math.max(tickEvery, Math.ceil(28 / (plotW / data.length)));
  const band = plotW / data.length;
  const gap = 2; // surface gap between neighbouring bars
  const barW = Math.max(2, Math.min(18, (band * 0.72 - gap * (series.length - 1)) / series.length));
  const groupW = barW * series.length + gap * (series.length - 1);
  const y = (value) => pad.top + plotH - (value / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  // a bar with a 4px rounded top, flat on the baseline
  const bar = (x, value, color) => {
    const h = (value / max) * plotH;
    if (h <= 0) return null;
    const r = Math.min(4, barW / 2, h);
    const top = pad.top + plotH - h;
    const base = pad.top + plotH;
    return <path d={`M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${base} Z`} fill={color} />;
  };

  return (
    <div className="admin-chart">
      {series.length > 1 && (
        <div className="admin-legend">
          {series.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>)}
        </div>
      )}
      <div className="admin-chart-plot" ref={plotRef} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={series.map((s) => s.label).join(" and ")}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} className="admin-grid" />
              <text x={pad.left - 6} y={y(tick)} className="admin-axis" textAnchor="end" dominantBaseline="middle">{tick}</text>
            </g>
          ))}
          {data.map((row, i) => {
            const x0 = pad.left + band * i + (band - groupW) / 2;
            return (
              <g key={row[xKey]}>
                {hover === i && <rect x={pad.left + band * i} y={pad.top} width={band} height={plotH} className="admin-hover-band" />}
                {series.map((s, j) => <g key={s.key}>{bar(x0 + j * (barW + gap), row[s.key] || 0, s.color)}</g>)}
                {i % every === 0 && (
                  <text x={pad.left + band * i + band / 2} y={height - 8} className="admin-axis" textAnchor="middle">{xTick(row[xKey])}</text>
                )}
                {/* hit target: the whole column, much bigger than the bars */}
                <rect x={pad.left + band * i} y={pad.top} width={band} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} />
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div className="admin-tooltip" style={{ left: `${((pad.left + band * hover + band / 2) / width) * 100}%` }}>
            <strong>{xLabel(data[hover][xKey])}</strong>
            {series.map((s) => (
              <span key={s.key}><i style={{ background: s.color }} />{s.label}: <b>{data[hover][s.key] || 0}</b></span>
            ))}
          </div>
        )}
      </div>
      <DataTable
        columns={[{ key: "x", label: "" }, ...series.map((s) => ({ key: s.key, label: s.label }))]}
        rows={data.map((row) => ({ x: xLabel(row[xKey]), ...Object.fromEntries(series.map((s) => [s.key, row[s.key] || 0])) }))}
      />
    </div>
  );
}

// A ranked list of horizontal bars (professions, funnel steps), each labelled with its value.
export function BarList({ items, color = SERIES_COLORS.designs, valueLabel = (item) => item.value, label = "Value" }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="admin-chart">
      <ul className="admin-barlist">
        {items.map((item) => (
          <li key={item.label} title={`${item.label}: ${valueLabel(item)}`}>
            <span className="admin-barlist-label">{item.label}</span>
            <span className="admin-barlist-track">
              <span className="admin-barlist-bar" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
            </span>
            <span className="admin-barlist-value">{valueLabel(item)}</span>
          </li>
        ))}
      </ul>
      <DataTable columns={[{ key: "label", label: "" }, { key: "value", label }]} rows={items.map((item) => ({ label: item.label, value: valueLabel(item) }))} />
    </div>
  );
}
