import { labelCategorie } from "../constants/categories";
import type { Item } from "../types/api";
import styles from "./ItemCard.module.css";
import AddToCollectionButton from "./AddToCollectionButton";

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
      <h2 className={styles.title}>{item.titre}</h2>
      <p className={styles.meta}>
        {item.auteur} · {item.annee}
        <AddToCollectionButton itemId={item.id} />  
      </p>
      <p className={styles.badge}>{labelCategorie(item.categorie)}</p>
    </article>
  );
}
