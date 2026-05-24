# MBV2 — Backend

API REST **NestJS**, organisée **par modules métier**, avec persistance **PostgreSQL** hébergée sur **Supabase**, via **MikroORM**.

## Architecture

- **`src/core/`** — transversal au projet (ex. configuration base de données).
- **`src/migrations/`** — évolutions du schéma PostgreSQL versionnées (MikroORM).
- **`src/modules/*/`** — un dossier **par capacité métier** (Nest `Module`, contrôleurs, logique métier).

Pour les modules riches, une **structure en couches** est encouragée : `domain/` → `application/` (use cases) → `infrastructure/` (ORM, implémentations) → `presentation/` (controllers). Le premier module suivant ce modèle est **Recipe**.

## Prérequis

- **Node.js** 20+
- Projet **Supabase** (PostgreSQL managé)
- Fichier **`backend/.env`** (non versionné)

## Variables d'environnement (Supabase)

1. Copier l'exemple :

```bash
cd backend
cp .env.example .env
```

2. Dans [Supabase](https://supabase.com/dashboard) → ton projet → **Project Settings** → **Database** :
   - récupérer le **Database password** (ou le réinitialiser) ;
   - copier la **Connection string** (URI) ou les champs Host / Port / Database.

3. Renseigner **une** des deux options dans `.env` :

| Méthode | Variables |
|---------|-----------|
| **URI (recommandé)** | `DATABASE_URL=postgresql://...` |
| **Détail** | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=postgres`, `DB_SSL=true` |

Hôte direct Supabase (exemple) : `db.cjndkdrjrjtitbkiszwo.supabase.co` — port **5432**, base **`postgres`**.

> Le SSL est activé automatiquement pour les hôtes `*.supabase.co` ou si `DB_SSL=true`. Obligatoire pour une connexion distante.

Les migrations (`npm run migration:up`) utilisent la même configuration que l'API.

### Supabase Storage (images recettes)

Bucket par défaut : **`recipe-images`**. Variables dans `.env` :

```env
SUPABASE_URL=https://cjndkdrjrjtitbkiszwo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   # Project Settings → API → service_role (secret)
SUPABASE_STORAGE_BUCKET=recipe-images
```

Upload : `POST /recipes/:id/image` (multipart, champ `file`, max 5 Mo).  
Fichier stocké sous `recipes/{recipeId}/cover.{ext}` ; `image_url` mis à jour en base.

## Installation

```bash
cd backend
npm install
```

## Première fois : créer les tables sur Supabase

Supabase affiche **0 table** tant que tu n’as pas appliqué les migrations **MikroORM** du backend (pas `supabase db push`).

### Étape 1 — Mot de passe et `.env`

1. [Dashboard Supabase](https://supabase.com/dashboard) → ton projet → **Project Settings** → **Database**.
2. Section **Database password** : note le mot de passe ou clique **Reset database password**.
3. Section **Connection string** → onglet **URI** → copie la chaîne (mode **Session** ou **Direct**).
4. Dans `backend/` :

```bash
copy .env.example .env
```

5. Ouvre `backend/.env` et renseigne **`DB_PASSWORD`** (mot de passe de la base Supabase, sans le mettre dans l’URI) :

```env
DB_PASSWORD=ton_mot_de_passe_supabase
```

> `.env` est dans `.gitignore` : ne jamais le committer. Si un outil (SonarLint) signale un secret dans `.env`, c’est attendu tant que le fichier est ouvert — ou exclu via `.vscode/settings.json`.

> Tant que `.env` contient `DB_HOST=localhost`, les migrations partent sur ta machine locale, **pas** sur Supabase.

### Étape 2 — Lancer la migration

```bash
cd backend
npm install
npm run migration:up
```

Si tout va bien, tu vois les migrations appliquées sans erreur.

### Étape 3 — Vérifier dans Supabase

**Table Editor** : tu dois voir notamment `recipes`, `recipe_types`, `users`, `equipment`, `recipe_ingredients`, `recipe_steps`, `recipe_equipment`, et la table de suivi `mikro_orm_migrations`.

### Étape 4 — Démarrer l’API

```bash
npm run start:dev
```

Test : [http://localhost:3333/health](http://localhost:3333/health) puis [http://localhost:3333/recipes](http://localhost:3333/recipes).

### En cas d’erreur fréquente

| Message | Cause probable |
|---------|----------------|
| `password authentication failed` | Mauvais mot de passe dans `.env` |
| `ECONNREFUSED` / timeout | `.env` encore en `localhost` ou pare-feu |
| `SSL required` | Ajoute `DB_SSL=true` ou utilise l’URI Supabase avec SSL |

## Migrations (évolutions suivantes)

```bash
npm run migration:up
```

Autres commandes :

| Commande | Rôle |
|----------|------|
| `npm run migration:list` | liste des migrations |
| `npm run migration:pending` | migrations non appliquées |
| `npm run migration:check` | vérifie si le schéma est à jour |
| `npm run migration:create` | génère une migration à partir des différences |
| `npm run migration:create:blank` | migration vide à remplir à la main |
| `npm run migration:down` | annule la dernière migration |

Configuration : `src/core/database/mikro-orm.config.ts`. Fichiers : `src/migrations/`.

> Les migrations du dossier racine `supabase/migrations/` (CLI Supabase) ne remplacent pas MikroORM pour ce backend.

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

## Structure (aperçu)

```
src/
  core/
    database/          # MikroORM + résolution Supabase / SSL
  migrations/
  modules/
    recipe/
  app.module.ts
  main.ts
```

## Qualité & tests

```bash
npm run lint
npm run format
npm run test
npm run test:e2e
```

## Références

- [NestJS](https://docs.nestjs.com/)
- [MikroORM](https://mikro-orm.io/)
- [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)
