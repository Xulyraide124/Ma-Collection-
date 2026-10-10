import { useEffect, useState } from "react";
import { useCollection } from "./useCollection";
import { getStats } from "../services/collectionService";
import type { Stats } from "../types/api";
import { messageFromError } from "../utils/errors";

interface StatsState {
  data: Stats | null;
  isLoading: boolean;
  error: string | null;
}

interface Resultat {
  version: unknown;
  data: Stats | null;
  error: string | null;
}

export function useStats(): StatsState {
  // `entries` change à chaque ajout, modification ou suppression
  const { entries } = useCollection();
  const [resultat, setResultat] = useState<Resultat | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getStats(controller.signal)
      .then((data) => setResultat({ version: entries, data, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResultat({ version: entries, data: null, error: messageFromError(err) });
      });
    return () => controller.abort();
  }, [entries]);

  const aJour = resultat !== null && resultat.version === entries;
  return {
    data: aJour ? resultat.data : null,
    error: aJour ? resultat.error : null,
    isLoading: !aJour,
  };
}