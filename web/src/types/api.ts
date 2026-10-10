export type Statut = "a_decouvrir" | "en_cours" | "termine";
export type TriCollection = "date" | "note";

export interface User {
  id: number;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Item {
  id: number;
  titre: string;
  categorie: string;
  description: string;
  image_url: string;
  annee: number;
  auteur: string;
  nb_pages: number;
}

export interface ItemPage {
  total: number;
  page: number;
  limit: number;
  results: Item[];
}

export interface ItemsQuery {
  q?: string;
  categorie?: string;
  page?: number;
  limit?: number;
}

export interface Entry {
  id: number;
  statut: Statut;
  note: number | null;
  commentaire: string | null;
  date_ajout: string;
  item: Item;
}

export interface EntryCreate {
  item_id: number;
  statut: Statut;
  note?: number | null;
  commentaire?: string | null;
}

export interface EntryUpdate {
  statut?: Statut;
  note?: number | null;
  commentaire?: string | null;
}

export interface Stats {
  total: number;
  par_statut: Record<Statut, number>;
  note_moyenne: number | null;
}

export interface ApiErrorBody {
  erreur: { code: number; message: string };
}