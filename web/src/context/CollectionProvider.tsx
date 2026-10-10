import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import * as collectionService from "../services/collectionService";
import type { Entry, EntryCreate, EntryUpdate } from "../types/api";
import { messageFromError } from "../utils/errors";
import { CollectionContext, type CollectionContextValue } from "./CollectionContext";

interface Chargement {
  userId: number;
  entries: Entry[];
  error: string | null;
}

interface CollectionProviderProps {
  children: ReactNode;
}

const AUCUNE_ENTREE: Entry[] = [];

export function CollectionProvider({ children }: CollectionProviderProps) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [etat, setEtat] = useState<Chargement | null>(null);

  useEffect(() => {
    if (userId === null) return;
    const controller = new AbortController();
    collectionService
      .getCollection({}, controller.signal)
      .then((entries) => setEtat({ userId, entries, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setEtat({ userId, entries: [], error: messageFromError(err) });
      });
    return () => controller.abort();
  }, [userId]);

  // Les données d'un autre utilisateur (ou d'une session fermée) ne sont jamais exposées
  const courant = userId !== null && etat !== null && etat.userId === userId ? etat : null;
  const entries = courant?.entries ?? AUCUNE_ENTREE;
  const isLoading = userId !== null && courant === null;
  const error = courant?.error ?? null;

  const addEntry = useCallback(async (data: EntryCreate): Promise<void> => {
    const entry = await collectionService.addEntry(data);
    setEtat((prev) => (prev === null ? prev : { ...prev, entries: [entry, ...prev.entries] }));
  }, []);

  const updateEntry = useCallback(async (id: number, data: EntryUpdate): Promise<void> => {
    const entry = await collectionService.updateEntry(id, data);
    setEtat((prev) =>
      prev === null ? prev : { ...prev, entries: prev.entries.map((e) => (e.id === id ? entry : e)) },
    );
  }, []);

  const removeEntry = useCallback(async (id: number): Promise<void> => {
    await collectionService.deleteEntry(id);
    setEtat((prev) =>
      prev === null ? prev : { ...prev, entries: prev.entries.filter((e) => e.id !== id) },
    );
  }, []);

  const isInCollection = useCallback(
    (itemId: number): boolean => entries.some((e) => e.item.id === itemId),
    [entries],
  );

  const value = useMemo<CollectionContextValue>(
    () => ({ entries, isLoading, error, isInCollection, addEntry, updateEntry, removeEntry }),
    [entries, isLoading, error, isInCollection, addEntry, updateEntry, removeEntry],
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}