export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  is_active: boolean;
  creator?: User;
  updates?: ActivityUpdate[];
}

export interface ActivityUpdate {
  id: number;
  activity_id: number;
  user_id: number;
  status: "pending" | "done";
  remark: string | null;
  activity_date: string;
  created_at: string;
  user: User;
  activity?: { id: number; name: string };
}