# Ma Collection

Application de bibliothèque personnelle : un catalogue public de 50 livres et une collection privée par utilisateur (statut, note, commentaire, statistiques).

- **Backend** : Python, FastAPI, SQLModel (accès asynchrone), PostgreSQL dans Docker
- **Frontend** : React 18+, TypeScript strict, Vite, React Router, CSS Modules

```
Ma-Collection-/
├── api/                      # API FastAPI (voir api/README.md)
├── web/                      # Interface React (voir web/README.md)
├── docker-compose.example.yml
├── .env.example
└── README.md
```

## Outils nécessaires

Le projet utilise quatre outils. Si tu les as déjà, passe directement à la vérification des versions.

| Outil | À quoi il sert | Version |
|---|---|---|
| **Git** | Récupérer le projet | récente |
| **Python** | Faire tourner l'API | 3.12 ou plus récente (testé avec 3.14) |
| **Node.js** (avec npm) | Faire tourner l'interface web | 20.19+ ou 22.12+ (prendre la version « LTS ») |
| **Docker Desktop** | Faire tourner la base de données PostgreSQL sans l'installer sur la machine | récente |

Un éditeur de code comme [Visual Studio Code](https://code.visualstudio.com/) est pratique mais facultatif.

### Installation sous Windows

1. **Git** : télécharger l'installateur sur https://git-scm.com/downloads et garder les options par défaut.
2. **Python** : télécharger sur https://www.python.org/downloads/. Sur le **premier écran** de l'installateur, **cocher « Add python.exe to PATH »**, sinon la commande `python` ne sera pas reconnue.
3. **Node.js** : télécharger la version **LTS** sur https://nodejs.org et garder les options par défaut (npm est inclus).
4. **Docker Desktop** : télécharger sur https://www.docker.com/products/docker-desktop/. Accepter l'activation de WSL 2 si elle est proposée et redémarrer si l'installateur le demande. Ensuite, **lancer Docker Desktop** et attendre qu'il indique qu'il est démarré : il doit rester ouvert pendant toute l'utilisation du projet.

### Installation sous macOS

Mêmes téléchargements que sous Windows, ou avec [Homebrew](https://brew.sh/) :

```bash
brew install git python node
brew install --cask docker
```

Puis lancer Docker Desktop une première fois.

### Installation sous Linux (Debian / Ubuntu)

```bash
sudo apt install git python3 python3-venv python3-pip
```

- **Node.js** : installer la version LTS depuis https://nodejs.org (ou avec `nvm`), car la version des dépôts de la distribution est souvent trop ancienne.
- **Docker** : suivre https://docs.docker.com/engine/install/ (installer aussi le plugin `docker compose`).

### Vérifier l'installation

Fermer puis rouvrir le terminal (PowerShell sous Windows), puis lancer :

```bash
git --version
python --version        # sous Linux / macOS : python3 --version
node --version
npm --version
docker --version
docker compose version
```

Chaque commande doit afficher un numéro de version. Si l'une d'elles n'est pas reconnue, l'outil correspondant n'est pas installé, ou le terminal doit être rouvert.

### Récupérer le projet

```bash
git clone <url du dépôt>
cd Ma-Collection-
```

Toutes les commandes des étapes suivantes se lancent depuis ce dossier (la **racine du dépôt**), sauf indication contraire.

### Windows : autoriser l'activation de l'environnement Python

Si l'étape 3 affiche une erreur du type « l'exécution de scripts est désactivée sur ce système », lancer cette commande dans le même terminal, puis recommencer l'activation :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

Elle ne modifie le réglage que pour ce terminal.

## 1. Configuration

Depuis la racine du dépôt :

```bash
# Linux / macOS
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
Copy-Item docker-compose.example.yml docker-compose.yml
```

Ouvrir ensuite `.env` et renseigner :

| Variable | Rôle |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Identifiants de la base créée par Docker |
| `DATABASE_URL` | URL utilisée par l'API. Le mot de passe doit être **identique** à `POSTGRES_PASSWORD`, et le port doit être celui exposé par Docker (5433) |
| `JWT_SECRET` | Clé de signature des tokens. À générer (voir ci-dessous) |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Durée de vie du token (30 par défaut) |

Générer le secret JWT :

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Conseil : choisir un mot de passe PostgreSQL alphanumérique (les caractères `@`, `/` et `:` doivent être encodés dans une URL).

Les fichiers `.env` et `docker-compose.yml` ne sont jamais versionnés.

## 2. Base de données

```bash
docker compose up -d
docker compose ps
```

Attendre que le service `db` soit `healthy` avant de continuer. PostgreSQL est exposé sur le port **5433** de la machine (5432 dans le conteneur), pour ne pas entrer en conflit avec un PostgreSQL déjà installé en local.

## 3. API

```bash
cd api
python -m venv .venv
```

Activer l'environnement virtuel :

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1
```

```bash
# Linux / macOS
source .venv/bin/activate
```

Puis :

```bash
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

- `seed.py` crée les tables et peuple le catalogue (50 livres, 5 catégories). Il peut être relancé sans créer de doublons. Le premier lancement prend environ une minute, car il cherche les couvertures sur Open Library (des images de repli sont utilisées hors connexion).
- L'API est disponible sur http://localhost:8000 et sa documentation interactive sur http://localhost:8000/docs.

## 4. Interface web

Dans un second terminal :

```bash
cd web
npm install
npm run dev
```

Ouvrir **http://localhost:5173** (et non `127.0.0.1:5173` : le CORS de l'API n'autorise que cette origine).

L'adresse de l'API peut être changée avec la variable `VITE_API_URL` (valeur par défaut : `http://localhost:8000`).

## Utilisation

1. Parcourir le catalogue sans compte : recherche (avec un délai de 400 ms), filtre par catégorie, pagination, fiche détaillée.
2. Créer un compte (mot de passe de 8 caractères minimum), puis ajouter des livres à sa collection.
3. Dans **Ma collection** : changer le statut, noter de 1 à 5, commenter, filtrer par statut, trier par date ou par note, retirer un livre.
4. Dans **Statistiques** : total, répartition par statut, note moyenne.
5. Le bouton 🌙 / ☀️ de la barre de navigation bascule entre le thème clair et le thème sombre (le choix est mémorisé dans le navigateur).

## Arrêt et remise à zéro

```bash
docker compose down        # arrête la base, conserve les données
docker compose down -v     # arrête ET supprime toutes les données
```

Après un `down -v`, relancer `docker compose up -d`, attendre `healthy`, puis `python seed.py` depuis `api/`.

## Choix de sécurité

- Mots de passe hachés avec bcrypt ; le hash n'apparaît dans aucun schéma de réponse.
- Token JWT à durée courte (30 minutes) : limite l'exploitation d'un token volé, sans imposer de reconnexion trop fréquente.
- Secret JWT et identifiants dans un `.env` non versionné.
- CORS limité à `http://localhost:5173`.
- Requêtes SQL paramétrées (aucune concaténation).
- Une entrée de collection n'est lisible, modifiable ou supprimable que par son propriétaire, vérifié côté serveur (404 pour une entrée d'un autre utilisateur).
- Limite connue : le token est stocké dans le `localStorage` du navigateur, donc lisible par un script injecté (faille XSS). L'alternative est un cookie `HttpOnly`, `Secure` et `SameSite`, associé à une protection CSRF.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `jwt_secret` ou `database_url` « Field required » | `.env` absent, vide, ou nom de variable mal orthographié |
| `password authentication failed for user "postgres"` | Mot de passe de `DATABASE_URL` différent de celui utilisé à la création du volume. Recréer la base avec `docker compose down -v` puis `docker compose up -d` (efface les données locales) |
| `Connect call failed ... 5433` | Conteneur non démarré, ou `DATABASE_URL` ne vise pas le port affiché par `docker compose ps` |
| Connexion coupée en cours d'opération | Un autre PostgreSQL occupe le port. Vérifier avec `Get-NetTCPConnection -LocalPort 5433 -State Listen` (Windows) |
| `python` ou `node` « n'est pas reconnu » | L'outil n'est pas installé, ou le terminal n'a pas été rouvert après l'installation. Sous Windows, réinstaller Python en cochant « Add python.exe to PATH » |
| `Cannot connect to the Docker daemon` ou « docker : le fichier spécifié est introuvable » | Docker Desktop n'est pas lancé. L'ouvrir, attendre qu'il soit démarré, puis relancer `docker compose up -d` |
| Page blanche ou erreur CORS dans le navigateur | Ouvrir `http://localhost:5173` et non `127.0.0.1`, et vérifier que l'API tourne |