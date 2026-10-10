import { useContext } from "react";
import { CollectionContext, type CollectionContextValue } from "../context/CollectionContext";

export function useCollection(): CollectionContextValue {
  const contexte = useContext(CollectionContext);
  if (contexte === null) {
    throw new Error("useCollection doit être utilisé à l'intérieur d'un CollectionProvider");
  }
  return contexte;
}