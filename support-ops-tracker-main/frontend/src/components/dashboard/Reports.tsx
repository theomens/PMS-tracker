import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { getReport, getActivities } from "../../Api";
import type { Activity, ActivityUpdate } from "../../types";

const getInitialDates = () => {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return { from, to };
};

export default function Reports() {
  const [dates] = useState(getInitialDates);
  const [from, setFrom] = useState(dates.from);
  const [to, setTo] = useState(dates.to);
  const [activityId, setActivityId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rows, setRows] = useState<ActivityUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [ran, setRan] = useState(false);

  const runReport = useCallback(
    async (
      fromDate = from,
      toDate = to,
      actId = activityId,
      stat = status
    ) => {
      if (!fromDate || !toDate) return;
      setLoading(true);
      try {
        const data = await getReport(
          fromDate,
          toDate,
          actId ? Number(actId) : undefined,
          stat || undefined
        );
        setRows(data);
        setRan(true);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [from, to, activityId, status]
  );

  useEffect(() => {
    let active = true;

    getActivities()
      .then((acts) => {
        if (active) setActivities(acts);
      })
      .catch(() => {});

    getReport(dates.from, dates.to)
      .then((data) => {
        if (active) {
          setRows(data);
          setRan(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setRows([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dates.from, dates.to]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runReport();
  };

  const exportCSV = () => {
    if (rows.length === 0) return;
    const headers = [
      "Date",
      "Activity",
      "Status",
      "Remark",
      "Personnel Name",
      "Personnel Email",
      "Timestamp",
    ];
    const csvRows = rows.map((r) => [
      `"${r.activity_date}"`,
      `"${(r.activity?.name || "").replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${(r.remark || "").replace(/"/g, '""')}"`,
      `"${(r.user?.name || "").replace(/"/g, '""')}"`,
      `"${(r.user?.email || "").replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `support_ops_report_${from}_to_${to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const totalUpdates = rows.length;
  const doneUpdates = rows.filter((r) => r.status === "done").length;
  const pendingUpdates = rows.filter((r) => r.status === "pending").length;
  const uniquePersonnel = new Set(rows.map((r) => r.user?.email).filter(Boolean)).size;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Activity History & Audit Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Query operational activity logs and personnel handovers across custom date ranges.
          </p>
        </div>
        {rows.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download size={14} className="text-slate-500" />
            Export CSV
          </button>
        )}
      </div>

      {/* Query Filters Form */}
      <form
        onSubmit={handleSearch}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 items-center gap-1">
              <Calendar size={13} />
              From Date
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 items-center gap-1">
              <Calendar size={13} />
              To Date
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Layers size={13} />
              Filter by Activity
            </label>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="">All Activities</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Filter size={13} />
              Filter by Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Generate Report"}
          </button>
        </div>
      </form>

      {/* Metrics for Query Result */}
      {ran && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Logged Records
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalUpdates}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Done Records
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{doneUpdates}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending Records
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{pendingUpdates}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Personnel Involved
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-800">{uniquePersonnel}</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Activity Date</th>
              <th className="px-5 py-3">Activity Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Remark / Handover Notes</th>
              <th className="px-5 py-3">Updated By (Personnel Bio)</th>
              <th className="px-5 py-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                  {r.activity_date}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-900 max-w-xs">
                  {r.activity?.name || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      r.status === "done"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {r.status === "done" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-600 max-w-md">
                  {r.remark || <span className="text-slate-400">—</span>}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      {r.user?.name ? r.user.name.slice(0, 2).toUpperCase() : "OP"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-xs">{r.user?.name || "Support Personnel"}</p>
                      <p className="text-[11px] text-slate-400">{r.user?.email || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  Running operational report query...
                </td>
              </tr>
            )}
            {!loading && ran && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  No activity records found matching the specified date range and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}