import { useState } from "react";
import ItemCard from "../components/ItemCard";
import Pagination from "../components/Pagination";
import { CATEGORIES } from "../constants/categories";
import { useDebounce } from "../hooks/useDebounce";
import { useItems } from "../hooks/useItems";
import styles from "./CataloguePage.module.css";

const LIMIT = 12;
const DEBOUNCE_MS = 400;
const MIN_RECHERCHE = 2;

export default function CataloguePage() {
  const [recherche, setRecherche] = useState<string>("");
  const [categorie, setCategorie] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const rechercheStable = useDebounce(recherche, DEBOUNCE_MS).trim();
  const q = rechercheStable.length >= MIN_RECHERCHE ? rechercheStable : undefined;

  const { data, isLoading, error } = useItems({
    q,
    categorie: categorie === "" ? undefined : categorie,
    page,
    limit: LIMIT,
  });

  return (
    <section>
      <h1>Catalogue</h1>
      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Titre, auteur…"
          aria-label="Rechercher un livre"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Filtrer par catégorie"
          value={categorie}
          onChange={(e) => {
            setCategorie(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Chargement…</p>}
      {error !== null && <p role="alert">{error}</p>}
      {data !== null && data.results.length === 0 && (
        <p>Aucun livre ne correspond à votre recherche.</p>
      )}
      {data !== null && data.results.length > 0 && (
        <>
          <ul className={styles.grid}>
            {data.results.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
          <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
        </>
      )}
    </section>
  );
}