import { Link } from "react-router-dom";
import StatusPage from "../components/StatusPage";

export default function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      titre="Page introuvable"
      message="La page que vous cherchez n'existe pas ou a été déplacée."
    >
      <Link to="/">Retour au catalogue</Link>
    </StatusPage>
  );
}