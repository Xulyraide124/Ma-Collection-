import type { FallbackProps } from "react-error-boundary";
import { Link } from "react-router-dom";
import StatusPage from "./StatusPage";

export default function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <StatusPage
      code="Oups"
      titre="Quelque chose s'est mal passé"
      message="Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir à l'accueil."
    >
      <button type="button" onClick={resetErrorBoundary}>Réessayer</button>
      <Link to="/" onClick={resetErrorBoundary}>Retour à l'accueil</Link>
    </StatusPage>
  );
}