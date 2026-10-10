import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ApiError, setAuthToken } from "../services/apiClient";
import * as authService from "../services/authService";
import type { Credentials, User } from "../types/api";
import { AuthContext, type AuthContextValue } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useLocalStorage<string | null>("token", null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(token !== null);

  // Doit passer avant les effets des composants enfants, qui appellent l'API
  useLayoutEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Valide le token auprès de l'API et charge l'utilisateur courant
  useEffect(() => {
    if (token === null) return;
    const controller = new AbortController();
    authService
      .getMe(controller.signal)
      .then((u) => setUser(u))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 401) setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [token, setToken]);

  const login = useCallback(
    async (credentials: Credentials): Promise<void> => {
      const reponse = await authService.login(credentials);
      setIsLoading(true);
      setToken(reponse.access_token);
    },
    [setToken],
  );

  const register = useCallback(
    async (credentials: Credentials): Promise<void> => {
      await authService.register(credentials);
      await login(credentials);
    },
    [login],
  );

  const logout = useCallback((): void => {
    setUser(null);
    setToken(null);
  }, [setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}