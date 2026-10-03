import client from "./client";
import type { UserProfile } from "../types";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  department?: string;
  designation?: string;
  district?: string;
  phone_number?: string;
  employee_id?: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>("/auth/login/", { username, password });
  return res.data;
}

export async function registerUser(payload: RegisterPayload): Promise<{ message: string; user: UserProfile; approval_status: string }> {
  const res = await client.post("/auth/register/", payload);
  return res.data;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const res = await client.get<UserProfile>("/auth/me/");
  return res.data;
}

export async function updateCurrentUser(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await client.patch<UserProfile>("/auth/me/", data);
  return res.data;
}

export async function getUsersList(): Promise<UserProfile[]> {
  const res = await client.get<UserProfile[]>("/auth/users/");
  return res.data;
}

export async function updateUserApproval(
  userId: number,
  action: "APPROVE" | "REJECT" | "UPDATE_ROLE",
  role?: string
): Promise<{ message: string }> {
  const res = await client.post<{ message: string }>(`/auth/users/${userId}/action/`, { action, role });
  return res.data;
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const res = await client.post<{ access: string }>("/auth/refresh/", { refresh });
  return res.data;
}

export async function ingestGeoData(formData: FormData): Promise<{
  status: string;
  layer_type: string;
  total_submitted: number;
  ingested_count: number;
  skipped_count: number;
  errors_sample: string[];
  message: string;
}> {
  const res = await client.post("/geodata/ingest/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function ingestGeoDataJson(payload: {
  layer_type: "habitations" | "safesites";
  geojson_data: any;
}): Promise<{
  status: string;
  layer_type: string;
  total_submitted: number;
  ingested_count: number;
  skipped_count: number;
  errors_sample: string[];
  message: string;
}> {
  const res = await client.post("/geodata/ingest/", payload);
  return res.data;
}