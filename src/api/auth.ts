import client from "./client";
import type { UserProfile } from "../types";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>("/auth/login/", { username, password });
  return res.data;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const res = await client.get<UserProfile>("/auth/me/");
  return res.data;
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const res = await client.post<{ access: string }>("/auth/refresh/", { refresh });
  return res.data;
}