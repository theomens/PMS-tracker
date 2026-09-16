import { useEffect, useState } from "react";
import { Plus, CheckCircle, AlertCircle, Layers } from "lucide-react";
import { getActivities, createActivity } from "../../Api";
import type { Activity } from "../../types";

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const refresh = async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch {
      setFeedback({ type: "error", message: "Failed to load activities." });
    }
  };

  useEffect(() => {
    let active = true;
    getActivities()
      .then((data) => {
        if (active) {
          setActivities(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setFeedback({ type: "error", message: "Failed to load activities." });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Activity name is required." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await createActivity(name.trim(), description.trim());
      setName("");
      setDescription("");
      setFeedback({ type: "success", message: `Activity "${name}" created successfully.` });
      await refresh();
    } catch (err: unknown) {
      let msg = "Failed to create activity.";
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) {
          msg = res.data.message;
        }
      }
      setFeedback({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Support Activities Registry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Define recurring operational checks and tracker activities for the application support team.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <Layers size={15} />
          <span>{activities.length} Registered Activities</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl p-3.5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form to Input New Activity */}
      <form
        onSubmit={handleAdd}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Add New Activity</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder='e.g. Daily SMS count in comparison to SMScount from logs'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Description / Instructions
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Cross-reference delivery logs against aggregation tables"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus size={16} />
            {saving ? "Saving..." : "Add Activity"}
          </button>
        </div>
      </form>

      {/* Activities Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Activity Name</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Created By (Personnel)</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-800">{a.name}</td>
                <td className="px-5 py-3.5 text-slate-500 max-w-md">{a.description || "—"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{a.creator?.name || "Support Personnel"}</span>
                    <span className="text-xs text-slate-400">{a.creator?.email || ""}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  Loading registered activities...
                </td>
              </tr>
            )}
            {!loading && activities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No activities registered yet. Use the form above to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}