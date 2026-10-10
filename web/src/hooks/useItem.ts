import { useEffect, useState } from "react";
import { getItem } from "../services/itemsService";
import { ApiError } from "../services/apiClient";
import type { Item } from "../types/api";
import { messageFromError } from "../utils/errors";

interface ItemState {
  data: Item | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

interface Resultat {
  id: number;
  data: Item | null;
  error: string | null;
  notFound: boolean;
}

export function useItem(id: number): ItemState {
  const [resultat, setResultat] = useState<Resultat | null>(null);

  useEffect(() => {
    if (!Number.isInteger(id)) return;
    const controller = new AbortController();
    getItem(id, controller.signal)
      .then((data) => setResultat({ id, data, error: null, notFound: false }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const notFound = err instanceof ApiError && err.status === 404;
        setResultat({ id, data: null, error: notFound ? null : messageFromError(err), notFound });
      });
    return () => controller.abort();
  }, [id]);

  if (!Number.isInteger(id)) return { data: null, isLoading: false, error: null, notFound: true };
  const aJour = resultat !== null && resultat.id === id;
  return {
    data: aJour ? resultat.data : null,
    error: aJour ? resultat.error : null,
    notFound: aJour ? resultat.notFound : false,
    isLoading: !aJour,
  };
}