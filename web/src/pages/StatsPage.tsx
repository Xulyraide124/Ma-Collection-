import { STATUTS } from "../constants/statuts";
import { useStats } from "../hooks/useStats";
import styles from "./StatsPage.module.css";

export default function StatsPage() {
  const { data, isLoading, error } = useStats();

  return (
    <section>
      <h1>Statistiques</h1>
      {isLoading && <p>Chargement…</p>}
      {error !== null && <p role="alert">{error}</p>}
      {data !== null && data.total === 0 && (
        <p>Aucune statistique pour l'instant : ajoutez des livres à votre collection.</p>
      )}
      {data !== null && data.total > 0 && (
        <>
          <dl className={styles.summary}>
            <div>
              <dt>Livres au total</dt>
              <dd>{data.total}</dd>
            </div>
            <div>
              <dt>Note moyenne</dt>
              <dd>{data.note_moyenne === null ? "Aucune note" : `${data.note_moyenne} / 5`}</dd>
            </div>
          </dl>
          <h2>Répartition par statut</h2>
          <ul className={styles.bars}>
            {STATUTS.map((s) => {
              const nombre = data.par_statut[s.value];
              const pourcentage = Math.round((nombre / data.total) * 100);
              return (
                <li key={s.value}>
                  <span>{s.label} : {nombre}</span>
                  <div className={styles.track} aria-hidden="true">
                    <div className={styles.fill} style={{ width: `${pourcentage}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}