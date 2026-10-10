import type { ApiErrorBody } from "../types/api";

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const erreur: unknown = (value as Record<string, unknown>).erreur;
  if (typeof erreur !== "object" || erreur === null) return false;
  const { code, message } = erreur as Record<string, unknown>;
  return typeof code === "number" && typeof message === "string";
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, signal } = options;

  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [cle, valeur] of Object.entries(params)) {
      if (valeur !== undefined && valeur !== "") url.searchParams.set(cle, String(valeur));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Impossible de joindre le serveur");
  }

  if (response.status === 204) {
    return undefined as T; // DELETE : aucun corps
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = isApiErrorBody(data) ? data.erreur.message : "Erreur inattendue";
    throw new ApiError(response.status, message);
  }
  return data as T;
}