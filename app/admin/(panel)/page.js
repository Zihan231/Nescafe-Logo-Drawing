"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { adminFetch } from "@/components/admin/api";
import { BarList, ColumnChart, SERIES_COLORS } from "@/components/admin/charts";

const shortDay = (day) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
const hourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

function Stat({ label, value, note }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {note && <div className="admin-stat-note">{note}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await adminFetch("/api/admin/stats"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60_000); // keeps itself current during the event
    return () => clearInterval(timer);
  }, [load]);

  const t = stats?.totals;
  const percent = (part, whole) => (whole ? `${Math.round((part / whole) * 100)}%` : "0%");

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-muted">Live numbers for the activation. Times are shown in {stats?.timeZone || "Asia/Dhaka"} time.</p>
        </div>
        <button type="button" className="admin-btn" onClick={load} disabled={loading}>
          <ArrowsClockwise size={16} aria-hidden="true" /> {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {!stats ? (
        !error && <p className="admin-muted">Loading…</p>
      ) : (
        <>
          <section className="admin-stats">
            <Stat label="Designs" value={t.designs} note={`${t.visibleDesigns} on the wall · ${t.hiddenDesigns} hidden`} />
            <Stat label="Designs today" value={t.designsToday} />
            <Stat label="Visitors registered" value={t.visitors} note={`${t.registrationsToday} today`} />
            <Stat label="Entered their code" value={t.verifiedVisitors} note={`${percent(t.verifiedVisitors, t.visitors)} of registered`} />
            <Stat label="Sent a design" value={t.visitorsWithDesigns} note={`${percent(t.visitorsWithDesigns, t.visitors)} of registered`} />          </section>
          {t.unlinkedDesigns > 0 && (
            <p className="admin-muted admin-small">{t.unlinkedDesigns} older design{t.unlinkedDesigns === 1 ? " was" : "s were"} sent before designs were linked to visitors, so they count in the totals but not per visitor.</p>
          )}

          <section className="admin-card">
            <h2>Last 14 days</h2>
            <ColumnChart
              data={stats.perDay}
              xKey="day"
              xLabel={shortDay}
              xTick={(day) => shortDay(day).split(" ")[0]}
              series={[
                { key: "registrations", label: "Registrations", color: SERIES_COLORS.registrations },
                { key: "designs", label: "Designs", color: SERIES_COLORS.designs }
              ]}
            />
          </section>

          <div className="admin-grid-2">
            <section className="admin-card">
              <h2>Busiest hours</h2>
              <p className="admin-muted admin-small">Designs sent in each hour of the day, all days together.</p>
              <ColumnChart data={stats.perHour} xKey="hour" xLabel={hourLabel} xTick={(hour) => String(hour)} tickEvery={3} series={[{ key: "designs", label: "Designs", color: SERIES_COLORS.designs }]} />
            </section>
            <section className="admin-card">
              <h2>Visitor journey</h2>
              <p className="admin-muted admin-small">How many visitors reached each step.</p>
              <BarList
                items={stats.funnel.map((step) => ({ label: step.step, value: step.count }))}
                color={SERIES_COLORS.registrations}
                valueLabel={(item) => `${item.value} (${percent(item.value, stats.funnel[0].count)})`}
                label="Visitors"
              />
            </section>
          </div>

          <section className="admin-card">
            <h2>Designs by profession</h2>
            <BarList items={stats.professions.map((p) => ({ label: p.name, value: p.count }))} label="Designs" />
            {stats.oldProfessionDesigns > 0 && (
              <p className="admin-muted admin-small">
                Not shown: {stats.oldProfessionDesigns} older design{stats.oldProfessionDesigns === 1 ? "" : "s"} with no profession or one that is no longer offered.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
