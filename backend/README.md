# MBV2 — Backend

API REST **NestJS**, organisée **par modules métier**, avec persistance **PostgreSQL** via **MikroORM**. Les photos de recettes sont des fichiers sur le disque ; la base ne stocke que leur URL.

## Architecture

- **`src/core/`** — transversal au projet (base de données, stockage des images).
- **`src/migrations/`** — évolutions du schéma PostgreSQL versionnées (MikroORM).
- **`src/modules/*/`** — un dossier **par capacité métier** (Nest `Module`, contrôleurs, logique métier).

Pour les modules riches, une **structure en couches** est encouragée : `domain/` → `application/` (use cases) → `infrastructure/` (ORM, implémentations) → `presentation/` (controllers). Le premier module suivant ce modèle est **Recipe**.

L’authentification (inscription, connexion, refresh, MFA) est locale : Argon2, JWT RS256, cookies `mb_access` et `mb_refresh`.

## Prérequis

- **Node.js** 20+
- **PostgreSQL** 16 (local, ou le service `postgres` de `docker-compose.yml` à la racine)
- Fichier **`backend/.env`** (non versionné)

## Variables d'environnement

1. Copier l'exemple :

```bash
cd backend
cp .env.example .env
```

2. Renseigner **une** des deux options dans `.env` :

| Méthode | Variables |
|---------|-----------|
| **Champs (recommandé)** | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=miambookv2_db`, `DB_SSL=false` |
| **URI** | `DATABASE_URL=postgresql://miambook:miambook@localhost:5432/miambookv2_db` |

Les migrations (`npm run migration:up`) utilisent la même configuration que l'API.

Les photos sont écrites dans `RECIPE_IMAGES_DIR` (défaut `data/recipe-images`) et servies en `GET /media/recipes/:id/cover.:ext`. L’URL enregistrée en base est `/api/media/...`, pour passer par le proxy Angular ou nginx.

## Installation

```bash
cd backend
npm install
```

Créer la base si elle n'existe pas, puis :

```bash
npm run migration:up
npm run start:dev
```

Test : [http://localhost:3333/health](http://localhost:3333/health) puis [http://localhost:3333/recipes](http://localhost:3333/recipes).

Avec Docker, depuis la racine du dépôt : voir le `README.md` racine. Le conteneur applique les migrations au démarrage (`RUN_MIGRATIONS=true`).

## Migrations

```bash
npm run migration:up
```

| Commande | Rôle |
|----------|------|
| `npm run migration:list` | liste des migrations |
| `npm run migration:pending` | migrations non appliquées |
| `npm run migration:check` | vérifie si le schéma est à jour |
| `npm run migration:create` | génère une migration à partir des différences |
| `npm run migration:create:blank` | migration vide à remplir à la main |
| `npm run migration:down` | annule la dernière migration |

Configuration : `src/core/database/mikro-orm.config.ts`. Fichiers : `src/migrations/`.

## Lancer l'API

```bash
npm run start:dev
```

Par défaut : port **3333** (`PORT` dans `.env`).

### Points de contrôle

- `GET /` — entrée racine
- `GET /health` — `{ "status": "ok" }`

### Routes métier

| Module | Préfixe | Exemples |
|--------|---------|----------|
| **Recipe** | `/recipes` | `GET /recipes`, `GET /recipes/:id`, `POST /recipes`, `PATCH /recipes/:id`, `POST /recipes/:id/image` |
| **Images** | `/media` | `GET /media/recipes/:id/cover.jpg` |

## Qualité & tests

```bash
npm run test
```

## Références

- [NestJS](https://docs.nestjs.com/)
- [MikroORM](https://mikro-orm.io/)
