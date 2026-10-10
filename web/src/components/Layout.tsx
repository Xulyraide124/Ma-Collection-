import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import styles from "./Layout.module.css";

function lienClasse({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useTheme();

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.brand}>📚 Ma Collection</Link>
          <div className={styles.links}>
            <NavLink to="/" end className={lienClasse}>Catalogue</NavLink>
            {user !== null ? (
              <>
                <NavLink to="/collection" className={lienClasse}>Ma collection</NavLink>
                <NavLink to="/stats" className={lienClasse}>Statistiques</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" className={lienClasse}>Connexion</NavLink>
                <NavLink to="/register" className={lienClasse}>Inscription</NavLink>
              </>
            )}
          </div>
          <div className={styles.actions}>
            {user !== null && <span className={styles.email}>{user.email}</span>}
            <button
              type="button"
              aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {user !== null && <button type="button" onClick={logout}>Déconnexion</button>}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}