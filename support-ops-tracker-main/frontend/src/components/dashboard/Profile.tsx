import { useAuth } from "./AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <div className="mt-6 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}