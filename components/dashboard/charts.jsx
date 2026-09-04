"use client";

import { useId, useMemo, useState } from "react";
import { Table2, LineChart as LineChartIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { compactMoney, compactNumber, money } from "@/lib/format";

/* ------------------------------------------------------------------ scales */

/** Round an axis maximum up to a clean 1/2/2.5/5 × 10^n step. */
export function niceScale(max, tickCount = 4) {
  if (!Number.isFinite(max) || max <= 0) return { max: 1, ticks: [0, 1] };
  const rough = max / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let value = 0; value <= top + step / 2; value += step) ticks.push(value);
  return { max: top, ticks };
}

const FORMATTERS = {
  money: compactMoney,
  moneyFull: money,
  number: compactNumber,
  percent: (v) => `${Math.round(v)}%`,
};

function formatWith(kind, value) {
  return (FORMATTERS[kind] || FORMATTERS.number)(value);
}

function tooltipValue(kind, value) {
  return kind === "money" ? money(value) : formatWith(kind, value);
}

/* ------------------------------------------------------------------- frame */

/**
 * Every chart lives in a frame that carries the title, the legend, and the
 * table-view twin. The table is the accessible equivalent — no value in these
 * charts is reachable only by hovering.
 */
export function ChartCard({ title, subtitle, legend, action, children, table, className }) {
  const [view, setView] = useState("chart");

  return (
    <section className={cn("flex flex-col rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {table ? (
            <button
              type="button"
              onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dash-line)] px-2.5 py-1.5 text-xs font-medium text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)]"
              aria-pressed={view === "table"}
            >
              {view === "chart" ? <Table2 className="size-3.5" /> : <LineChartIcon className="size-3.5" />}
              {view === "chart" ? "Table" : "Chart"}
            </button>
          ) : null}
        </div>
      </header>

      {legend ? <div className="px-5 pt-4">{legend}</div> : null}

      <div className="flex-1 px-2 pb-4 pt-3">
        {view === "chart" ? children : <div className="px-3">{table}</div>}
      </div>
    </section>
  );
}

/** Identity channel that never depends on colour alone — swatch plus label. */
export function Legend({ items, className }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-xs text-[var(--dash-ink-2)]">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: item.color }} aria-hidden />
          <span>{item.label}</span>
          {item.value ? <span className="font-semibold text-[var(--dash-ink)] tabular-nums">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export function DataTable({ head, rows, className }) {
  return (
    <div className={cn("max-h-64 overflow-auto dash-scroll", className)}>
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-[var(--dash-surface)]">
          <tr className="text-[var(--dash-muted)]">
            {head.map((cell, i) => (
              <th key={cell} scope="col" className={cn("border-b border-[var(--dash-line)] py-2 pr-3 font-medium", i > 0 && "text-right")}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--dash-ink-2)]">
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-[var(--dash-grid)] last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={cn("py-2 pr-3", i > 0 && "text-right font-medium tabular-nums text-[var(--dash-ink)]")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------------- tooltip */

function Tooltip({ point, containerWidth }) {
  if (!point) return null;
  const clamped = Math.min(Math.max(point.x, 8), 92);
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg bg-[var(--dash-ink)] px-3 py-2 text-xs text-white shadow-lg"
      style={{ left: `${clamped}%` }}
      role="status"
    >
      <p className="font-semibold">{point.label}</p>
      <ul className="mt-1 space-y-0.5">
        {point.rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 whitespace-nowrap">
            {row.color ? <span className="size-2 rounded-[2px]" style={{ background: row.color }} aria-hidden /> : null}
            <span className="text-white/70">{row.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------- area line */

const W = 800;

/**
 * One series over time. 2px line, 10% wash beneath it, an end marker with a
 * 2px surface ring, and a crosshair tooltip.
 */
export function AreaTrend({ data, format = "money", height = 220, color = "var(--series-1)", label = "Value" }) {
  const gradientId = useId();
  const [hover, setHover] = useState(null);
  const pad = { top: 16, right: 18, bottom: 26, left: 58 };
  const plotW = W - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const scale = useMemo(() => niceScale(Math.max(...data.map((d) => d.value), 0)), [data]);
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;
  const x = (i) => pad.left + i * step;
  const y = (v) => pad.top + plotH - (v / scale.max) * plotH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${pad.top + plotH} L${pad.left},${pad.top + plotH} Z`;
  const last = data[data.length - 1];

  return (
    <figure className="relative m-0">
      <Tooltip point={hover} />
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={`${label} over time`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} className="dash-grid-line" />
            <text x={pad.left - 10} y={y(tick) + 4} textAnchor="end" className="dash-axis-text">
              {formatWith(format, tick)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {hover ? <line x1={x(hover.index)} x2={x(hover.index)} y1={pad.top} y2={pad.top + plotH} className="dash-axis-line" /> : null}

        {last ? (
          <circle cx={x(data.length - 1)} cy={y(last.value)} r="5" fill={color} stroke="var(--dash-surface)" strokeWidth="2" />
        ) : null}

        {data.map((d, i) => (
          <g key={d.key || i}>
            {i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? (
              <text x={x(i)} y={height - 8} textAnchor="middle" className="dash-axis-text">
                {d.label}
              </text>
            ) : null}
            <rect
              x={x(i) - step / 2}
              y={pad.top}
              width={Math.max(step, 24)}
              height={plotH}
              fill="transparent"
              tabIndex={0}
              onMouseEnter={() =>
                setHover({ index: i, x: ((x(i) - 0) / W) * 100, label: d.full || d.label, rows: [{ label, value: tooltipValue(format, d.value), color }] })
              }
              onFocus={() =>
                setHover({ index: i, x: ((x(i) - 0) / W) * 100, label: d.full || d.label, rows: [{ label, value: tooltipValue(format, d.value), color }] })
              }
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
    </figure>
  );
}

/* ------------------------------------------------------------------ columns */

/**
 * Columns for one or two stacked series. Segments are separated by a 2px gap
 * in the surface colour rather than a stroke.
 */
export function ColumnChart({
  data,
  series = [{ key: "value", label: "Value", color: "var(--series-1)" }],
  format = "money",
  height = 220,
  labelExtreme = true,
}) {
  const [hover, setHover] = useState(null);
  const pad = { top: 22, right: 18, bottom: 26, left: 58 };
  const plotW = W - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const stacked = series.length > 1;

  const totals = data.map((d) => (stacked ? series.reduce((sum, s) => sum + (d.values?.[s.key] || 0), 0) : d.value || 0));
  const scale = useMemo(() => niceScale(Math.max(...totals, 0)), [totals.join(",")]);

  const band = plotW / Math.max(data.length, 1);
  const barW = Math.min(24, band * 0.62);
  const y = (v) => pad.top + plotH - (v / scale.max) * plotH;
  const centre = (i) => pad.left + band * i + band / 2;
  const peak = totals.indexOf(Math.max(...totals));

  return (
    <figure className="relative m-0">
      <Tooltip point={hover} />
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={series.map((s) => s.label).join(" and ")}>
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} className="dash-grid-line" />
            <text x={pad.left - 10} y={y(tick) + 4} textAnchor="end" className="dash-axis-text">
              {formatWith(format, tick)}
            </text>
          </g>
        ))}
        <line x1={pad.left} x2={W - pad.right} y1={pad.top + plotH} y2={pad.top + plotH} className="dash-axis-line" />

        {data.map((d, i) => {
          const total = totals[i];
          const rows = stacked
            ? series.map((s) => ({ label: s.label, value: tooltipValue(format, d.values?.[s.key] || 0), color: s.color }))
            : [{ label: series[0].label, value: tooltipValue(format, d.value || 0), color: series[0].color }];
          const point = { index: i, x: (centre(i) / W) * 100, label: d.full || d.label, rows };

          // Stack from the baseline up. Touching segments are separated by a
          // 2px gap in the surface colour, taken off the upper segment so the
          // bottom of the stack still sits flush on the baseline.
          let cursor = pad.top + plotH;
          const segments = [];
          for (const s of stacked ? series : [series[0]]) {
            const value = stacked ? d.values?.[s.key] || 0 : d.value || 0;
            const rawHeight = (value / scale.max) * plotH;
            if (rawHeight <= 0) continue;
            const top = cursor - rawHeight;
            cursor = top;
            const gap = stacked && segments.length ? 2 : 0;
            segments.push({ key: s.key, color: s.color, top: top + gap, height: Math.max(rawHeight - gap, 1) });
          }

          return (
            <g
              key={d.key || i}
              onMouseEnter={() => setHover(point)}
              onFocus={() => setHover(point)}
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
              tabIndex={0}
            >
              <rect x={pad.left + band * i} y={pad.top} width={band} height={plotH} fill="transparent" />
              {segments.map((segment, index) => {
                const isTop = index === segments.length - 1;
                return (
                  <rect
                    key={segment.key}
                    x={centre(i) - barW / 2}
                    y={segment.top}
                    width={barW}
                    height={segment.height}
                    rx={isTop ? 4 : 0}
                    fill={segment.color}
                  />
                );
              })}
              {labelExtreme && i === peak && total > 0 ? (
                <text x={centre(i)} y={y(total) - 8} textAnchor="middle" className="fill-[var(--dash-ink)] text-[11px] font-semibold">
                  {formatWith(format, total)}
                </text>
              ) : null}
              <text x={centre(i)} y={height - 8} textAnchor="middle" className="dash-axis-text">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/* -------------------------------------------------------------- rank bars */

/** Ranked horizontal bars, value direct-labelled at the tip. */
export function RankBars({ data, format = "money", color = "var(--series-1)", emphasis }) {
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  return (
    <ul className="space-y-2.5 px-3">
      {data.map((row) => (
        <li key={row.key ?? row.id ?? row.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-[var(--dash-ink-2)]">{row.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-[var(--dash-ink)]">{formatWith(format, row.value)}</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--dash-grid)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((row.value / max) * 100, 1.5)}%`,
                background: emphasis && row.key !== emphasis ? "#c3ccd9" : row.color || color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Part-to-whole as one split bar. Segments carry a 2px surface gap and are
 * direct-labelled below, so the two low-contrast slots stay readable.
 */
export function SplitBar({ data, format = "money", colors }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="px-3">
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-[var(--dash-grid)]">
        {data.map((row, i) => (
          <div
            key={row.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${total ? (row.value / total) * 100 : 0}%`, background: colors[i] }}
            aria-hidden
          />
        ))}
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.map((row, i) => (
          <div key={row.key} className="flex items-center gap-2.5">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: colors[i] }} aria-hidden />
            <div className="min-w-0">
              <dt className="truncate text-xs text-[var(--dash-muted)]">{row.label}</dt>
              <dd className="text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
                {formatWith(format, row.value)}
                <span className="ml-1.5 text-xs font-medium text-[var(--dash-ink-2)]">{Math.round(total ? (row.value / total) * 100 : 0)}%</span>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** 12-point sparkline for stat tiles. No axis, no tooltip — the tile has the number. */
export function Sparkline({ data, color = "var(--series-1)", height = 36 }) {
  const width = 120;
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 0) || 1;
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const y = (v) => height - 3 - ((v - min) / span) * (height - 6);
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-full" aria-hidden focusable="false">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {values.length ? <circle cx={(values.length - 1) * step} cy={y(values[values.length - 1])} r="3" fill={color} /> : null}
    </svg>
  );
}
