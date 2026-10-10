import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EntryCard from "../components/EntryCard";
import { STATUTS, isStatut } from "../constants/statuts";
import { useCollection } from "../hooks/useCollection";
import type { Entry, Statut, TriCollection } from "../types/api";
import styles from "./CollectionPage.module.css";

type FiltreStatut = Statut | "";

function parDate(a: Entry, b: Entry): number {
  return Date.parse(b.date_ajout) - Date.parse(a.date_ajout);
}

function parNote(a: Entry, b: Entry): number {
  return (b.note ?? 0) - (a.note ?? 0) || parDate(a, b);
}

export default function CollectionPage() {
  const { entries, isLoading, error } = useCollection();
  const [filtre, setFiltre] = useState<FiltreStatut>("");
  const [tri, setTri] = useState<TriCollection>("date");

  const affichees = useMemo(() => {
    const filtrees = filtre === "" ? entries : entries.filter((e) => e.statut === filtre);
    return [...filtrees].sort(tri === "note" ? parNote : parDate);
  }, [entries, filtre, tri]);

  return (
    <section>
      <h1>Ma collection</h1>
      <div className={styles.filters}>
        <select
          aria-label="Filtrer par statut"
          value={filtre}
          onChange={(e) => setFiltre(isStatut(e.target.value) ? e.target.value : "")}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          aria-label="Trier"
          value={tri}
          onChange={(e) => setTri(e.target.value === "note" ? "note" : "date")}
        >
          <option value="date">Plus récents d'abord</option>
          <option value="note">Mieux notés d'abord</option>
        </select>
      </div>

      {isLoading && <p>Chargement…</p>}
      {error !== null && <p role="alert">{error}</p>}
      {!isLoading && error === null && entries.length === 0 && (
        <p>Votre collection est vide. <Link to="/">Parcourir le catalogue</Link></p>
      )}
      {entries.length > 0 && affichees.length === 0 && <p>Aucun livre avec ce statut.</p>}
      <ul className={styles.list}>
        {affichees.map((entry) => (
          <li key={entry.id}>
            <EntryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}