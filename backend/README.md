# MBV2 — Backend

API REST **NestJS**, organisée **par modules métier**, avec persistance **PostgreSQL** via **MikroORM**. Ce dépôt hébergera plusieurs domaines fonctionnels au fil du temps ; chaque brique importante vit sous `src/modules/<nom-du-module>/`.

## Architecture

- **`src/core/`** — transversal au projet (ex. configuration base de données).
- **`src/migrations/`** — évolutions du schéma PostgreSQL versionnées.
- **`src/modules/*/`** — un dossier **par capacité métier** (Nest `Module`, contrôleurs, logique métier).

Pour les modules riches, une **structure en couches** est encouragée : `domain/` → `application/` (use cases) → `infrastructure/` (ORM, implémentations) → `presentation/` (controllers). Le premier module suivant ce modèle est **Recipe** ; les prochains peuvent réutiliser le même schéma ou s’adapter au besoin.

## Prérequis

- **Node.js** (LTS recommandé, ex. 20+)
- **PostgreSQL** accessible localement ou à distance
- Un fichier **`.env`** à la racine du dossier `backend/` (voir ci-dessous)

## Variables d’environnement

Crée un fichier `backend/.env` (il est ignoré par Git). Exemple :

```env
PORT=3333

DB_HOST=localhost
DB_PORT=5432
DB_USER=user_name
DB_PASSWORD=ton_mot_de_passe
DB_NAME=nom__bdd
```

Tu peux aussi utiliser **`MIKRO_ORM_PASSWORD`** à la place de `DB_PASSWORD` si besoin — la config fusionne les variables MikroORM au démarrage.

> Les commandes de migration utilisent la même connexion que l’application.

## Installation

```bash
cd backend
npm install
```

## Migrations

Applique le schéma (tables, colonnes, etc.) :

```bash
npm run migration:up
```

Autres commandes utiles :

| Commande | Rôle |
|----------|------|
| `npm run migration:list` | liste des migrations |
| `npm run migration:pending` | migrations non appliquées |
| `npm run migration:check` | vérifie si le schéma est à jour |
| `npm run migration:create` | génère une migration à partir des différences |
| `npm run migration:create:blank` | migration vide à remplir à la main |
| `npm run migration:down` | annule la dernière migration |

Configuration : `src/core/database/mikro-orm.config.ts`. Fichiers de migration TypeScript : `src/migrations/`.

## Lancer l’API

```bash
# développement (rechargement à chaud)
npm run start:dev

# production (build puis node)
npm run build
npm run start:prod
```

Par défaut : **`PORT`** depuis l’environnement, sinon **3333**.

### Points de contrôle globaux

- `GET /` — entrée racine de l’API
- `GET /health` — statut `{ "status": "ok" }`

### Routes métier (au fil des modules)

Chaque module peut exposer son préfixe HTTP via ses controllers Nest. À ce jour :

| Module | Préfixe | Exemples |
|--------|---------|----------|
| **Recipe** | `/recipes` | `GET /recipes`, `GET /recipes/:id`, `POST /recipes` |

Les futurs modules ajouteront leurs propres préfixes (ex. `/users`, `/ingredients`) en les important dans `AppModule` comme les modules existants.

## Structure du projet (aperçu)

```
src/
  core/
    database/          # MikroORM (connexion, entités par glob)
  migrations/          # Migrations PostgreSQL
  modules/
    recipe/            # Premier module métier (pattern en couches)
      domain/
      application/
      infrastructure/
      presentation/
    # ... autres modules à l’avenir
  app.module.ts        # Compose MikroORM + les modules métier
  main.ts
```

## Qualité & tests

```bash
npm run lint
npm run format
npm run test
npm run test:e2e
npm run test:cov
```

## Références

- [NestJS](https://docs.nestjs.com/)
- [MikroORM](https://mikro-orm.io/) — [NestJS integration](https://mikro-orm.io/docs/usage-with-nestjs)
