import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header>
        <nav>
          <Link to="/">Catalogue</Link>
          {user !== null ? (
            <>
              <Link to="/collection">Ma collection</Link>
              <Link to="/stats">Statistiques</Link>
              <span>{user.email}</span>
              <button type="button" onClick={logout}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Inscription</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}