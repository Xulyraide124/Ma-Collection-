import type { Credentials, TokenResponse, User } from "../types/api";
import { request } from "./apiClient";

export function register(credentials: Credentials): Promise<User> {
  return request<User>("/auth/register", { method: "POST", body: credentials });
}

export function login(credentials: Credentials): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", { method: "POST", body: credentials });
}

export function getMe(signal?: AbortSignal): Promise<User> {
  return request<User>("/auth/me", { signal });
}