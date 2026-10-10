import { useEffect, useState } from "react";

export function useDebounce<T>(valeur: T, delaiMs: number): T {
  const [valeurDebounced, setValeurDebounced] = useState<T>(valeur);

  useEffect(() => {
    const id = window.setTimeout(() => setValeurDebounced(valeur), delaiMs);
    return () => window.clearTimeout(id);
  }, [valeur, delaiMs]);

  return valeurDebounced;
}