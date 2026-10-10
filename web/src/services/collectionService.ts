import type {
  Entry,
  EntryCreate,
  EntryUpdate,
  Stats,
  Statut,
  TriCollection,
} from "../types/api";
import { request } from "./apiClient";

interface CollectionParams {
  statut?: Statut;
  tri?: TriCollection;
}

export function getCollection(params: CollectionParams = {}, signal?: AbortSignal): Promise<Entry[]> {
  return request<Entry[]>("/me/collection", { params: { ...params }, signal });
}

export function addEntry(data: EntryCreate): Promise<Entry> {
  return request<Entry>("/me/collection", { method: "POST", body: data });
}

export function updateEntry(id: number, data: EntryUpdate): Promise<Entry> {
  return request<Entry>(`/me/collection/${id}`, { method: "PATCH", body: data });
}

export function deleteEntry(id: number): Promise<void> {
  return request<void>(`/me/collection/${id}`, { method: "DELETE" });
}

export function getStats(signal?: AbortSignal): Promise<Stats> {
  return request<Stats>("/me/stats", { signal });
}