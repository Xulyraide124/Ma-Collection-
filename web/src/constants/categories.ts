export interface CategorieOption {
  value: string;
  label: string;
}

export const CATEGORIES: readonly CategorieOption[] = [
  { value: "cuisine", label: "Cuisine" },
  { value: "developpement personnel", label: "Développement personnel" },
  { value: "roman", label: "Roman" },
  { value: "fantasy", label: "Fantasy" },
  { value: "piece de theatre", label: "Pièce de théâtre" },
];

export function labelCategorie(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}