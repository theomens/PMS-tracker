import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, Calendar, Send, CheckCircle, HelpCircle, ArrowRightLeft, } from "lucide-react";
import { getDailyView, postUpdate } from "../../Api";
import type { Activity } from "../../types";
import { toast } from "sonner";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function DailyLog() {
  const [date, setDate] = useState(todayStr());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, { status: "pending" | "done" | ""; remark: string }>>({});
  const [notification, setNotification] = useState<{type: "success" | "error";message: string;} | null>(null);

  const refreshData = async () => {
    try {
      const data = await getDailyView(date);
      setActivities(data.activities || []);
    } catch {
      toast.error('Failed to get daily update')
    }
  };

  useEffect(() => {
    let active = true;
    getDailyView(date)
      .then((data) => {
        if (active) {
          setActivities(data.activities || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [date]);

  const updateForm = (
    id: number,
    field: "status" | "remark",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [id]: {
        status:
          field === "status"
            ? (value as "pending" | "done" | "")
            : prev[id]?.status || "",
        remark: field === "remark" ? value : prev[id]?.remark || "",
      },
    }));
  };

  const submitUpdate = async (activityId: number) => {
    const entry = form[activityId];
    if (!entry?.status) return;

    setSubmittingId(activityId);
    try {
      await postUpdate(
        activityId,
        entry.status as "pending" | "done",
        entry.remark || "",
        date
      );
      setForm((prev) => ({
        ...prev,
        [activityId]: { status: "", remark: "" },
      }));
      setNotification({
        type: "success",
        message: `Status updated successfully for activity #${activityId}.`,
      });
      setTimeout(() => setNotification(null), 4000);
      await refreshData();
    } catch (err: unknown) {
      let msg = "Failed to update status. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setNotification({
        type: "error",
        message: msg,
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSubmittingId(null);
    }
  };

  // Compute Handover Metrics
  const activityMetrics = activities.map((activity) => {
    const updates = activity.updates || [];
    const latest = updates[updates.length - 1];
    return {
      activity,
      latest,
      status: latest ? latest.status : "unlogged",
    };
  });

  const totalCount = activities.length;
  const doneCount = activityMetrics.filter((m) => m.status === "done").length;
  const pendingCount = activityMetrics.filter((m) => m.status === "pending").length;
  const unloggedCount = activityMetrics.filter((m) => m.status === "unlogged").length;

  const filteredMetrics = activityMetrics.filter((m) => {
    if (filter === "pending") return m.status === "pending";
    if (filter === "done") return m.status === "done";
    return true;
  });

  return (
    <div className="p-8">
      {/* Page Header & Date Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Daily Activity Log & Handover</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track daily status updates, personnel bio attribution, timestamps, and pending handover items.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Calendar size={18} className="text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm font-medium text-slate-700 outline-none"
          />
        </div>
      </div>

      {notification && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl border p-3.5 text-sm ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Handover Executive Summary Banner */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tracked</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Done Today</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{doneCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Handover</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Not Yet Updated</p>
          <p className="mt-2 text-2xl font-bold text-slate-600">{unloggedCount}</p>
        </div>
      </div>

      {/* Handover Notice Callout */}
      {pendingCount > 0 ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">
              Shift Handover Notice: {pendingCount} {pendingCount === 1 ? "activity requires" : "activities require"} follow-up
            </p>
            <p className="mt-0.5 text-amber-700">
              The incoming support personnel should prioritize the pending activities below. 
            </p>
          </div>
        </div>
      ) : totalCount > 0 && doneCount === totalCount ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-800">Clean Handover: All activities marked as Done</p>
            <p className="text-emerald-700">All registered activities for {date} have been completed by the team.</p>
          </div>
        </div>
      ) : null}

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Activities ({totalCount})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filter === "pending"
              ? "bg-amber-600 text-white"
              : "text-amber-700 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          <Clock size={13} />
          Pending Handover ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("done")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filter === "done"
              ? "bg-emerald-600 text-white"
              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 size={13} />
          Done ({doneCount})
        </button>
      </div>

      {/* Activities List */}
      <div className="mt-4 space-y-4">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <p>Loading activity logs for {date}...</p>
          </div>
        )}

        {!loading && filteredMetrics.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <p>No activities match the selected filter for {date}.</p>
          </div>
        )}

        {!loading &&
          filteredMetrics.map(({ activity, status }) => {
            const updates = activity.updates || [];
            const isSubmitting = submittingId === activity.id;

            return (
              <div
                key={activity.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                  status === "pending"
                    ? "border-amber-200 ring-1 ring-amber-200/50"
                    : "border-slate-200"
                }`}
              >
                {/* Header: Name and Status Badge */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {activity.name}
                    </h3>
                    {activity.description && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {activity.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {status === "done" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={14} />
                        Done
                      </span>
                    )}
                    {status === "pending" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200 animate-pulse">
                        <Clock size={14} />
                        Pending Handover
                      </span>
                    )}
                    {status === "unlogged" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200">
                        <HelpCircle size={14} />
                        Not Yet Updated Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Updates History Table / Timeline */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Remark / Handover Notes</th>
                        <th className="px-4 py-2.5">Updated By (Personnel Bio)</th>
                        <th className="px-4 py-2.5 text-right">Time Done</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {updates.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-4 text-center text-slate-400 italic"
                          >
                            No updates recorded yet for this activity on {date}.
                          </td>
                        </tr>
                      ) : (
                        updates.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold text-[11px] capitalize ${
                                  u.status === "done"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {u.status === "done" ? (
                                  <CheckCircle2 size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {u.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700 max-w-md">
                              {u.remark || <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                  {u.user?.name
                                    ? u.user.name.slice(0, 2).toUpperCase()
                                    : "OP"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {u.user?.name || "Support Personnel"}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {u.user?.email || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-600">
                              {new Date(u.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Quick Update Form (Requirement 2 & 3) */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                  <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <ArrowRightLeft size={13} className="text-emerald-600" />
                    Record New Status Update / Handover Note
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={form[activity.id]?.status || ""}
                      onChange={(e) =>
                        updateForm(activity.id, "status", e.target.value)
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 sm:w-40"
                    >
                      <option value="">Select Status...</option>
                      <option value="done">Done</option>
                      <option value="pending">Pending (Handover)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Input remark or details (e.g. verified logs, count matches 15,400 SMS)..."
                      value={form[activity.id]?.remark || ""}
                      onChange={(e) =>
                        updateForm(activity.id, "remark", e.target.value)
                      }
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      disabled={isSubmitting || !form[activity.id]?.status}
                      onClick={() => submitUpdate(activity.id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Send size={13} />
                      {isSubmitting ? "Saving..." : "Save Update"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}