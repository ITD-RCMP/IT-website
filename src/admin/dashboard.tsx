import React from "react";
import { Link, useLoaderData, useNavigate, useRouteContext, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { downloadFeedbackPdf } from "@/admin/exportFeedbackPdf";
import { logoutUser } from "@/lib/auth";
import { RATING_LABELS } from "@/lib/feedback";
import type { FeedbackStats } from "@/lib/feedback-api";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const VISIBLE_SUGGESTIONS = 5;

function formatPeriod(year: number, month: number) {
  return new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-1 border-t border-neutral-200 pt-4 first:border-t-0 first:pt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="text-3xl font-light tracking-tight text-neutral-900">{value}</p>
      {hint ? <p className="text-sm text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-neutral-700">{label}</p>
        <p className="text-sm tabular-nums text-neutral-500">{value}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-[#0077C8] transition-all" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PercentBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  const width = percent > 0 ? Math.max(percent, 4) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-neutral-700">{label}</p>
        <p className="text-sm tabular-nums text-neutral-500">{percent.toFixed(1)}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-[#0077C8] transition-all" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useRouteContext({ from: "/admin" });
  const { year, month } = useSearch({ from: "/admin/" });
  const { stats } = useLoaderData({ from: "/admin/" }) as { stats: FeedbackStats };
  const navigate = useNavigate();
  const logout = useServerFn(logoutUser);
  const [busy, setBusy] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = React.useState(false);

  React.useEffect(() => {
    setShowAllSuggestions(false);
  }, [year, month]);

  const visibleSuggestions = showAllSuggestions
    ? stats.recentSuggestions
    : stats.recentSuggestions.slice(0, VISIBLE_SUGGESTIONS);
  const hasMoreSuggestions = stats.recentSuggestions.length > VISIBLE_SUGGESTIONS;

  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set([...stats.availableYears, currentYear, year]);
    return Array.from(years).sort((a, b) => b - a);
  }, [stats.availableYears, year]);

  const setFilter = (nextYear: number, nextMonth: number) => {
    void navigate({ to: "/admin", search: { year: nextYear, month: nextMonth } });
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await downloadFeedbackPdf(stats, year, month);
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      await navigate({ to: "/about" });
    } finally {
      setBusy(false);
    }
  };

  const categoryMax = Math.max(...stats.byCategory.map((item) => item.count), 1);
  const ratingTotal = stats.byRating.reduce((sum, item) => sum + item.count, 0);
  const questionChart = stats.byQuestion.map((item) => ({
    name: `Q${item.sortOrder}`,
    score: item.averageScore ?? 0,
    full: item.question,
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(0,119,200,0.10), transparent 55%), radial-gradient(ellipse 60% 40% at 95% 5%, rgba(10,132,255,0.08), transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-4 pt-1">
          <img
            src="/unikl-official.png"
            alt="UniKL Royal College of Medicine Perak"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 disabled:opacity-50"
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </header>

        <section className="flex-1 space-y-10 py-10 sm:py-12">
          <div className="space-y-3 animate-[dashIn_0.6s_ease-out_both]">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              Staff portal
            </p>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900 sm:text-5xl">
              Feedback <span className="font-medium">Overview</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-neutral-600">
              Statistics for {formatPeriod(year, month)}.
            </p>
            <div className="flex flex-wrap items-end gap-3 pt-2">
              <label className="space-y-1.5">
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  Month
                </span>
                <select
                  value={month}
                  onChange={(e) => setFilter(year, Number(e.target.value))}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
                >
                  {MONTHS.map((label, index) => (
                    <option key={label} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  Year
                </span>
                <select
                  value={year}
                  onChange={(e) => setFilter(Number(e.target.value), month)}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20"
                >
                  {yearOptions.map((optionYear) => (
                    <option key={optionYear} value={optionYear}>
                      {optionYear}
                    </option>
                  ))}
                </select>
              </label>
              <Link
                to="/admin/manage-feedback"
                className="inline-flex items-center justify-center rounded-full bg-[#0077C8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0066AD]"
              >
                Manage feedback
              </Link>
              <button
                type="button"
                onClick={() => void handleExportPdf()}
                disabled={exporting}
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                {exporting ? "Exporting…" : "Export PDF"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 animate-[dashIn_0.6s_ease-out_0.08s_both] sm:grid-cols-2">
            <Metric label="Total responses" value={String(stats.totalResponses)} />
            <Metric
              label="Average score"
              value={stats.averageScore == null ? "—" : `${stats.averageScore.toFixed(2)} / 5`}
              hint="Across all rated questions"
            />
          </div>

          {stats.totalResponses === 0 ? (
            <div className="animate-[dashIn_0.6s_ease-out_0.12s_both] space-y-4 border-y border-neutral-200 py-10">
              <h2 className="text-2xl font-light tracking-tight text-neutral-900">
                No feedback for {formatPeriod(year, month)}
              </h2>
              <p className="max-w-xl text-base leading-7 text-neutral-600">
                Try another month or year, or check back once new responses are submitted.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-10 animate-[dashIn_0.6s_ease-out_0.12s_both] lg:grid-cols-2">
                <section className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-medium tracking-tight text-neutral-900">
                      By Category
                    </h2>
                    <p className="text-sm text-neutral-500">Who is submitting feedback</p>
                  </div>
                  <div className="space-y-4">
                    {stats.byCategory.map((item) => (
                      <ScoreBar
                        key={item.category}
                        label={item.category}
                        value={item.count}
                        max={categoryMax}
                      />
                    ))}
                  </div>
                </section>

                <section className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-medium tracking-tight text-neutral-900">
                      Rating mix
                    </h2>
                    <p className="text-sm text-neutral-500">All question ratings combined</p>
                  </div>
                  <div className="space-y-4">
                    {stats.byRating.map((item) => (
                      <PercentBar
                        key={item.rating}
                        label={item.rating}
                        value={item.count}
                        total={ratingTotal}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <section className="space-y-5 animate-[dashIn_0.6s_ease-out_0.16s_both]">
                <div className="space-y-1">
                  <h2 className="text-xl font-medium tracking-tight text-neutral-900">
                    Question averages
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Mean score from {RATING_LABELS[0]} to {RATING_LABELS[4]}
                  </p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#737373", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} tick={{ fill: "#737373", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(0,119,200,0.06)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.[0]) return null;
                          const item = payload[0].payload as { full: string; score: number; name: string };
                          return (
                            <div className="max-w-xs rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                              <p className="text-xs font-medium text-[#0077C8]">{item.name}</p>
                              <p className="mt-1 text-sm text-neutral-700">{item.full}</p>
                              <p className="mt-2 text-sm tabular-nums text-neutral-900">
                                Avg {item.score.toFixed(2)} / 5
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="score" fill="#0077C8" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="space-y-5 animate-[dashIn_0.6s_ease-out_0.2s_both]">
                <div className="space-y-1">
                  <h2 className="text-xl font-medium tracking-tight text-neutral-900">
                    Recent suggestions
                  </h2>
                  <p className="text-sm text-neutral-500">Comments from this period</p>
                </div>
                <ul className="space-y-4">
                  {visibleSuggestions.map((item) => (
                    <li key={item.id} className="border-t border-neutral-200 pt-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700">{item.category}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-neutral-800">{item.suggestion}</p>
                    </li>
                  ))}
                </ul>
                {hasMoreSuggestions ? (
                  <button
                    type="button"
                    onClick={() => setShowAllSuggestions((value) => !value)}
                    className="text-sm font-semibold text-[#0077C8] transition hover:text-[#0066AD]"
                  >
                    {showAllSuggestions
                      ? "Show less"
                      : `See more (${stats.recentSuggestions.length - VISIBLE_SUGGESTIONS} more)`}
                  </button>
                ) : null}
              </section>
            </>
          )}
        </section>

        <footer className="border-t border-neutral-200/80 pb-6 pt-8">
          <p className="text-right text-xs font-medium text-neutral-400">
            © 2026 Information Technology Department RCMP
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes dashIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
