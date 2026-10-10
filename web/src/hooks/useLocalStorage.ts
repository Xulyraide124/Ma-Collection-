import { useCallback, useState } from "react";

export function useLocalStorage<T>(
  cle: string,
  valeurInitiale: T,
): [T, (v: T) => void] {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const brut = window.localStorage.getItem(cle);
      return brut !== null ? (JSON.parse(brut) as T) : valeurInitiale;
    } catch {
      return valeurInitiale;
    }
  });

  const definir = useCallback(
    (v: T): void => {
      setValeur(v);
      try {
        window.localStorage.setItem(cle, JSON.stringify(v));
      } catch {
        // stockage plein ou désactivé : on garde la valeur en mémoire
      }
    },
    [cle],
  );

  return [valeur, definir];
}