import { useEffect, useState } from "react";
import { getItems } from "../services/itemsService";
import type { ItemPage, ItemsQuery } from "../types/api";

interface Resultat {
  cle: string;
  data: ItemPage | null;
  error: string | null;
}

interface ItemsState {
  data: ItemPage | null;
  isLoading: boolean;
  error: string | null;
}

export function useItems(query: ItemsQuery): ItemsState {
  const { q, categorie, page, limit } = query;
  const cle = JSON.stringify({ q, categorie, page, limit });
  const [resultat, setResultat] = useState<Resultat | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getItems({ q, categorie, page, limit }, controller.signal)
      .then((data) => setResultat({ cle, data, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Erreur inattendue";
        setResultat({ cle, data: null, error: message });
      });
    return () => controller.abort();
  }, [cle, q, categorie, page, limit]);

  const aJour = resultat !== null && resultat.cle === cle;
  return {
    data: aJour ? resultat.data : null,
    error: aJour ? resultat.error : null,
    isLoading: !aJour,
  };
}