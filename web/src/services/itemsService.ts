import type { Item, ItemPage, ItemsQuery } from "../types/api";
import { request } from "./apiClient";

export function getItems(query: ItemsQuery = {}, signal?: AbortSignal): Promise<ItemPage> {
  return request<ItemPage>("/items", { params: { ...query }, signal });
}

export function getItem(id: number, signal?: AbortSignal): Promise<Item> {
  return request<Item>(`/items/${id}`, { signal });
}