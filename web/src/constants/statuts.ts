import type { Statut } from "../types/api";

export const STATUTS: readonly { value: Statut; label: string }[] = [
  { value: "a_decouvrir", label: "À découvrir" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

export function isStatut(valeur: string): valeur is Statut {
  return STATUTS.some((s) => s.value === valeur);
}