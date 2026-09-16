import axios from "axios";
import type { Activity, ActivityUpdate } from "./types";

export const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach bearer token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: automatically store token if provided in header
api.interceptors.response.use(
  (response) => {
    const tokenHeader =
      response.headers["x-auth-token"] ||
      response.headers["X-Auth-Token"];
    if (tokenHeader && typeof tokenHeader === "string") {
      localStorage.setItem("auth_token", tokenHeader);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // If unauthenticated and not already on login page, clear credentials
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const getActivities = () =>
  api.get<Activity[]>("/api/activities").then((r) => r.data);

export const createActivity = (name: string, description: string) =>
  api.post<Activity>("/api/activities", { name, description }).then((r) => r.data);

export const postUpdate = (
  activityId: number,
  status: "pending" | "done",
  remark: string,
  activityDate: string
) =>
  api
    .post<ActivityUpdate>(`/api/activities/${activityId}/updates`, {
      status,
      remark,
      activity_date: activityDate,
    })
    .then((r) => r.data);

export const getDailyView = (date: string) =>
  api
    .get<{ date: string; activities: Activity[] }>("/api/daily-view", { params: { date } })
    .then((r) => r.data);

export const getReport = (
  from: string,
  to: string,
  activityId?: number,
  status?: string
) =>
  api
    .get<ActivityUpdate[]>("/api/reports", {
      params: {
        from,
        to,
        activity_id: activityId || undefined,
        status: status || undefined,
      },
    })
    .then((r) => r.data);