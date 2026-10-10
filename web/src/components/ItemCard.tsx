import { Link } from "react-router-dom";
import { labelCategorie } from "../constants/categories";
import type { Item } from "../types/api";
import AddToCollectionButton from "./AddToCollectionButton";
import styles from "./ItemCard.module.css";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <article className={styles.card}>
      <img
        className={styles.cover}
        src={item.image_url}
        alt={`Couverture de ${item.titre}`}
        loading="lazy"
      />
      <h2 className={styles.title}>
        <Link to={`/items/${item.id}`}>{item.titre}</Link>
      </h2>
      <p className={styles.meta}>{item.auteur} · {item.annee}</p>
      <p className={styles.badge}>{labelCategorie(item.categorie)}</p>
      <div className={styles.action}>
        <AddToCollectionButton itemId={item.id} />
      </div>
    </article>
  );
}