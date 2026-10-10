import { useEffect, useState } from "react";
import { getItems } from "./services/itemsService";

export default function App() {
  const [message, setMessage] = useState<string>("Chargement…");

  useEffect(() => {
    getItems({ limit: 3 })
      .then((page) => setMessage(`${page.total} livres, premier : ${page.results[0]?.titre ?? "aucun"}`))
      .catch((err: unknown) => setMessage(err instanceof Error ? err.message : "Erreur"));
  }, []);

  return <p>{message}</p>;
}