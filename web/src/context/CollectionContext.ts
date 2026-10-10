import { createContext } from "react";
import type { Entry, EntryCreate, EntryUpdate } from "../types/api";

export interface CollectionContextValue {
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
  isInCollection: (itemId: number) => boolean;
  addEntry: (data: EntryCreate) => Promise<void>;
  updateEntry: (id: number, data: EntryUpdate) => Promise<void>;
  removeEntry: (id: number) => Promise<void>;
}

export const CollectionContext = createContext<CollectionContextValue | null>(null);