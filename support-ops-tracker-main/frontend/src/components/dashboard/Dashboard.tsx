import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ListChecks,
  ArrowRight,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { getDailyView } from "../../Api";
import { useAuth } from "./AuthContext";
import type { Activity } from "../../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0, unlogged: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    getDailyView(today)
      .then((data) => {
        let done = 0;
        let pending = 0;
        let unlogged = 0;

        const acts = data.activities || [];
        acts.forEach((a) => {
          const latest = a.updates?.[a.updates.length - 1];
          if (!latest) {
            unlogged++;
          } else if (latest.status === "done") {
            done++;
          } else {
            pending++;
          }
        });

        setStats({ total: acts.length, done, pending, unlogged });
        setActivities(acts);
      })
      .catch(() => {
        // Fallback gracefully on network error or redirection
      })
      .finally(() => {
        setLoading(false);
      });
  }, [today]);

  const cards = [
    {
      label: "Total tracked activities",
      value: stats.total,
      icon: ListChecks,
      color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      label: "Done today",
      value: stats.done,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      label: "Pending handover",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border border-amber-100",
    },
  ];

  const pendingActivities = activities.filter((a) => {
    const latest = a.updates?.[a.updates.length - 1];
    return latest?.status === "pending";
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Support Operations & Handover Overview for today ({today}).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/daily-log"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            <ClipboardList size={15} />
            Go to Daily Log
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <BarChart3 size={15} className="text-slate-500" />
            Query Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
            >
              <Icon size={22} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {loading ? "..." : value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Handover Priority Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Today's Shift Handover Priority
            </h2>
            {stats.pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {stats.pending} Action Required
              </span>
            )}
          </div>
          <Link
            to="/daily-log"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Update activities <ArrowRight size={14} />
          </Link>
        </div>

        {stats.pending > 0 ? (
          <div className="mt-4 space-y-3">
            {pendingActivities.map((a) => {
              const latest = a.updates?.[a.updates.length - 1];
              return (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{a.name}</p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {latest?.remark || "Pending completion"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right text-xs">
                      <p className="font-medium text-slate-700">
                        {latest?.user?.name || "Support Personnel"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {latest?.created_at
                          ? new Date(latest.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                    <Link
                      to="/daily-log"
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              No pending handover bottlenecks for today
            </p>
            <p className="text-xs text-slate-400 mt-1">
              All logged activities are completed or not yet scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}