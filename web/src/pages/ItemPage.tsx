import { Link, useParams } from "react-router-dom";
import AddToCollectionButton from "../components/AddToCollectionButton";
import { labelCategorie } from "../constants/categories";
import { useItem } from "../hooks/useItem";
import styles from "./ItemPage.module.css";

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, notFound } = useItem(Number(id));

  if (isLoading) return <p>Chargement…</p>;
  if (notFound) return <p>Ce livre n'existe pas. <Link to="/">Retour au catalogue</Link></p>;
  if (error !== null) return <p role="alert">{error}</p>;
  if (data === null) return null;

  return (
    <article className={styles.item}>
      <img className={styles.cover} src={data.image_url} alt={`Couverture de ${data.titre}`} />
      <div>
        <h1>{data.titre}</h1>
        <p>{data.auteur} · {data.annee} · {data.nb_pages} pages</p>
        <p>{labelCategorie(data.categorie)}</p>
        <p>{data.description}</p>
        <AddToCollectionButton itemId={data.id} />
        <p><Link to="/">← Retour au catalogue</Link></p>
      </div>
    </article>
  );
}