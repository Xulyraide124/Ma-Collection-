import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCollection } from "../hooks/useCollection";
import { messageFromError } from "../utils/errors";

interface AddToCollectionButtonProps {
  itemId: number;
}

export default function AddToCollectionButton({ itemId }: AddToCollectionButtonProps) {
  const { user } = useAuth();
  const { isInCollection, addEntry } = useCollection();
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (user === null) return <Link to="/login">Connectez-vous pour l'ajouter</Link>;
  if (isInCollection(itemId)) return <p>Dans ma collection ✓</p>;

  async function handleClick(): Promise<void> {
    setPending(true);
    setError(null);
    try {
      await addEntry({ item_id: itemId, statut: "a_decouvrir" });
    } catch (err: unknown) {
      setError(messageFromError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" disabled={pending} onClick={() => void handleClick()}>
        {pending ? "Ajout…" : "Ajouter à ma collection"}
      </button>
      {error !== null && <p role="alert">{error}</p>}
    </>
  );
}