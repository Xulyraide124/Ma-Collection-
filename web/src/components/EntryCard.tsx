import { useState, type ChangeEvent } from "react";
import { STATUTS, isStatut } from "../constants/statuts";
import { useCollection } from "../hooks/useCollection";
import type { Entry } from "../types/api";
import { messageFromError } from "../utils/errors";
import styles from "./EntryCard.module.css";

interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { updateEntry, removeEntry } = useCollection();
  const [commentaire, setCommentaire] = useState<string>(entry.commentaire ?? "");
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function appliquer(action: () => Promise<void>): Promise<void> {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (err: unknown) {
      setError(messageFromError(err));
    } finally {
      setPending(false);
    }
  }

  function changerStatut(e: ChangeEvent<HTMLSelectElement>): void {
    const valeur = e.target.value;
    if (!isStatut(valeur)) return;
    void appliquer(() => updateEntry(entry.id, { statut: valeur }));
  }

  function changerNote(e: ChangeEvent<HTMLSelectElement>): void {
    const note = e.target.value === "" ? null : Number(e.target.value);
    void appliquer(() => updateEntry(entry.id, { note }));
  }

  function enregistrerCommentaire(): void {
    const texte = commentaire.trim();
    void appliquer(() => updateEntry(entry.id, { commentaire: texte === "" ? null : texte }));
  }

  function supprimer(): void {
    if (!window.confirm(`Retirer « ${entry.item.titre} » de votre collection ?`)) return;
    void appliquer(() => removeEntry(entry.id));
  }

  return (
    <article className={styles.card}>
      <img className={styles.cover} src={entry.item.image_url} alt={`Couverture de ${entry.item.titre}`} loading="lazy" />
      <div className={styles.body}>
        <h2 className={styles.title}>{entry.item.titre}</h2>
        <p className={styles.meta}>
          {entry.item.auteur} · ajouté le {new Date(entry.date_ajout).toLocaleDateString("fr-FR")}
        </p>
        <fieldset className={styles.fields} disabled={pending}>
          <label>
            Statut
            <select value={entry.statut} onChange={changerStatut}>
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label>
            Note
            <select value={entry.note ?? ""} onChange={changerNote}>
              <option value="">Pas de note</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} / 5</option>
              ))}
            </select>
          </label>
          <label>
            Commentaire
            <textarea value={commentaire} maxLength={1000} rows={2} onChange={(e) => setCommentaire(e.target.value)} />
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={enregistrerCommentaire}>Enregistrer le commentaire</button>
            <button type="button" className={styles.danger} onClick={supprimer}>Retirer</button>
          </div>
        </fieldset>
        {error !== null && <p role="alert">{error}</p>}
      </div>
    </article>
  );
}