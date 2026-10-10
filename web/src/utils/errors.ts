import { ApiError } from "../services/apiClient";

export function messageFromError(err: unknown): string {
  return err instanceof ApiError ? err.message : "Une erreur est survenue";
}