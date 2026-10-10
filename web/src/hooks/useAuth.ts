import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";

export function useAuth(): AuthContextValue {
  const contexte = useContext(AuthContext);
  if (contexte === null) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return contexte;
}