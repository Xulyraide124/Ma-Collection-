import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/apiClient";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) await login({ email, password });
      else await register({ email, password });
      navigate("/collection", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <h1>{isLogin ? "Connexion" : "Inscription"}</h1>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={isLogin ? undefined : 8}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </label>
      {error !== null && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Patientez…" : isLogin ? "Se connecter" : "Créer mon compte"}
      </button>
      <p>
        {isLogin ? (
          <>Pas de compte ? <Link to="/register">S'inscrire</Link></>
        ) : (
          <>Déjà inscrit ? <Link to="/login">Se connecter</Link></>
        )}
      </p>
    </form>
  );
}