# Interface web Ma Collection

Application React 18+ avec TypeScript en mode strict, construite avec Vite. La procédure de lancement complète est dans le [README racine](../README.md).

## Lancement rapide

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173 (l'API doit tourner sur http://localhost:8000).

Autres commandes :

```bash
npm run lint      # ESLint
npx tsc -b        # vérification des types
npm run build     # build de production
```

L'adresse de l'API se change avec la variable `VITE_API_URL`.

## Structure

```
src/
├── types/api.ts          # types du contrat d'API, écrits à la main
├── services/             # client HTTP unique (apiClient.ts) et services par ressource
├── context/              # AuthContext / AuthProvider, CollectionContext / CollectionProvider
├── hooks/                # useLocalStorage<T>, useDebounce<T>, useTheme, useAuth, useCollection, useItems, useItem, useStats
├── constants/            # catégories et statuts
├── components/           # Layout, ProtectedRoute, AuthForm, ItemCard, EntryCard, Pagination, AddToCollectionButton
├── pages/                # Catalogue, Item, Login, Register, Collection, Stats
└── utils/                # traduction des erreurs
```

## Choix de conception

- **Typage** : `strict: true`, aucun `any`. Le statut est une union littérale (`"a_decouvrir" | "en_cours" | "termine"`). Les corps d'erreur de l'API sont traités en `unknown` puis vérifiés par un type guard.
- **Client HTTP unique** : tous les appels réseau passent par `src/services/apiClient.ts`, qui ajoute l'en-tête `Authorization` et transforme le format d'erreur de l'API en classe `ApiError`. Aucun `fetch` ailleurs.
- **Contextes** : `AuthContext` (token et utilisateur) et `CollectionContext` (entrées de l'utilisateur, ajout, modification, suppression).
- **Routes protégées** : `/collection` et `/stats` redirigent vers `/login` sans token valide. Le catalogue et les fiches restent publics.
- **États** : chargement, erreur et vide sont traités sur chaque écran qui appelle l'API.
- **Recherche** : délai (debounce) de 400 ms, requête annulée si elle devient obsolète (`AbortController`), minimum 2 caractères.
- **Style** : CSS Modules, aucune bibliothèque de composants ; lisible dès 375 px de large.
- **Thème clair / sombre** : variables CSS, bascule par le bouton de la barre de navigation, choix mémorisé avec `useLocalStorage` (premier choix selon le réglage du système).
- **Token** : stocké dans le `localStorage` via `useLocalStorage`. Risque : un script injecté (XSS) peut le lire. Alternative : cookie `HttpOnly` avec protection CSRF.
