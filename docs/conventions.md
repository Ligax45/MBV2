# MBV2 — Conventions de code

Conventions du projet MiamBookV2, basées sur les pratiques réellement observées dans le dépôt — pas une spec aspirational.

Référencé par le skill `.cursor/skills/code-review/` et utilisable par tout agent ou contributeur.

---

## Structure du mono-repo

```
MBV2/
├── backend/              # API NestJS (port 3333)
├── frontend-angular/     # Application Angular (port 4200)
└── .cursor/              # règles et skills agent
```

Les deux paquets sont **indépendants** : chacun a son propre `package.json`, `node_modules` et commandes npm.

---

## Backend NestJS

### Organisation modulaire

Architecture en couches par feature sous `backend/src/modules/` :

```
modules/<feature>/
├── <feature>.module.ts
├── domain/           # entités, enums, interfaces repository
├── application/      # use cases, utils métier, mappers de réponse
├── infrastructure/   # ORM, repos impl, services techniques (JWT, hashing…)
└── presentation/     # controllers, guards, decorators, strategies
```

Transversal : `backend/src/core/` (database, storage), `backend/src/migrations/`.

### Règles

- **Un use case = une action métier** → fichier `*.usecase.ts`, injecté dans le controller.
- **Repository** : interface dans `domain/repositories/` + token `Symbol` (`RECIPE_REPOSITORY`) + impl `MikroOrm*Repository` dans `infrastructure/repositories/*.repository.impl.ts`.
- **Entité domaine** (`domain/entities/*.entity.ts`) séparée de l'entité ORM (`*.orm-entity.ts`).
- **Mapping ORM → domaine** : méthode privée `toDomain()` dans l'impl du repository.
- **Réponses API** : fonctions utilitaires (`*-response.util.ts`), pas de serializers Nest dédiés.
- **Autorisation métier** : utils dédiés (`*-authorization.util.ts`), en complément des guards HTTP.
- **Nouveau module riche** : suivre le découpage du module `recipe` (référence).

### Nommage backend

| Pattern | Usage |
|---------|-------|
| `*.module.ts` | Module NestJS |
| `*.usecase.ts` | Use case applicatif |
| `*.orm-entity.ts` | Entité MikroORM |
| `*.repository.ts` | Interface repository (domain) |
| `*.repository.impl.ts` | Implémentation repository |
| `*.controller.ts` | Controller REST |
| `*.guard.ts` / `*.decorator.ts` / `*.strategy.ts` | Couche presentation auth |
| `*-response.util.ts` / `*-authorization.util.ts` | Utils application |
| `*.entity.ts` | Entité domaine |
| `*.enum.ts` | Enum domaine |

Kebab-case, guillemets simples, trailing commas (Prettier).

---

## API REST

- **Pas de préfixe global Nest** — le proxy Angular réécrit `/api` → backend `:3333`.
- Préfixes par module : `recipes`, `auth`, `admin`.
- **Pas de fichiers `*.dto.ts`** — types inline dans controllers ou interfaces domaine (`CreateRecipeParams`).
- **Validation manuelle** dans les use cases via `BadRequestException` (pas de `ValidationPipe` global ni `class-validator`).
- **Query params booléens** : chaînes `'true'` (`?favorites=true`, `?mine=true`).
- **JSON** : camelCase (`imageUrl`, `recipeTypeId`). Dates en ISO string.
- **Erreurs** : exceptions Nest natives (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`).
- Messages d'erreur métier en **français** ; messages de validation technique souvent en anglais — ne pas uniformiser sans décision explicite.

---

## Auth

### Backend

- JWT **RS256** (paire de clés, `JwtKeysModule`).
- Access token 15 min, refresh token 30 jours en DB.
- Guards : `JwtAuthGuard`, `OptionalJwtAuthGuard`, `RolesGuard`.
- Décorateurs : `@CurrentUser()`, `@Roles(UserRole.Admin, ...)`.
- Rôles : `user | moderator | admin`.

### Frontend

- Tokens en `localStorage` (`miambook_access_token`, `miambook_refresh_token`, `miambook_user`).
- `AuthService` : signals + `restoreSession()` au démarrage.
- `authInterceptor` : Bearer token + refresh automatique sur 401.
- `CurrentUserService` : façade computed (`isAdmin`, `canModerateRecipes`, `hasRole()`).
- Guards fonctionnels `CanActivateFn` (`authGuard`, `roleGuard`) avec `route.data.roles`.

Tout changement auth doit être vérifié **des deux côtés** (backend guards + frontend interceptor/guards).

---

## Database / MikroORM

- Entités : classe TS + `EntitySchema` exporté, suffixe `*.orm-entity.ts`.
- Tables/colonnes en **snake_case** via `fieldName`.
- UUID PK avec `defaultRaw: 'gen_random_uuid()'`.
- Migrations : `Migration{YYYYMMDDHHMMSS}_{PascalCaseDescription}.ts`, SQL via `this.addSql()`.
- Toute évolution de schéma **doit** inclure une migration versionnée — pas de modification manuelle en prod.

---

## Frontend Angular

### Organisation

```
src/app/
├── core/       # services, guards, interceptors, models, utils, constants
├── features/   # pages par domaine (auth, library, create-recipe, admin…)
├── layout/     # shell + composants layout
└── shared/     # composants réutilisables
```

Alias TypeScript : `@core/*`, `@features/*`, `@layout/*`, `@shared/*`.

### Règles

- **Standalone** (pas de `NgModule`), lazy loading via `loadComponent`.
- Fichiers séparés : `*.component.ts/html/scss`.
- État local : **signals** (`signal`, `computed`) + `inject()`.
- **Double couche services** :
  - `*-api.service.ts` : appels HTTP bruts.
  - `*-data.service.ts` : façade composants, mapping API → modèles UI, bascule mock/API.
- Routes en **français** : `/bibliotheque`, `/connexion`, `/admin/utilisateurs`.
- UI : PrimeNG + thème Aura, SCSS global dans `src/styles/`.
- Modèles API : `*-api.model.ts` ; modèles UI : `*.model.ts`.

### Nommage frontend

| Pattern | Usage |
|---------|-------|
| `*.component.ts/html/scss` | Composant |
| `*.routes.ts` | Routes feature |
| `*-api.service.ts` | Service HTTP brut |
| `*-data.service.ts` | Façade données |
| `*-api.model.ts` | Types réponse API |
| `*.model.ts` | Modèles UI |
| `*.mapper.ts` / `*.util.ts` | Transformation |
| `*.constant.ts` | Constantes |
| `*.data.ts` | Données bouchon (mock) |

---

## Qualité et tooling

| Paquet | Lint | Typecheck | Tests | Build |
|--------|------|-----------|-------|-------|
| `backend/` | `npm run lint` | via `npm run build` | `npm run test` | `npm run build` |
| `frontend-angular/` | — | via `npm run build` | `npm run test` | `npm run build` |

- Backend : ESLint + Prettier (`eslint.config.mjs`, `strictNullChecks: true`).
- Frontend : Prettier + TypeScript strict (`strict: true`, `strictTemplates`) — **pas d'ESLint frontend**.

Ne pas signaler en review ce que le tooling enforce déjà (formatage Prettier, règles ESLint backend).

---

## Écarts connus (ne pas traiter comme violations sauf aggravation)

1. Pas de DTOs ni validation déclarative — validation manuelle dans les use cases.
2. `UserOrmEntity` dans le module `recipe`, réutilisé par `auth` — couplage inter-modules existant.
3. Messages d'erreur bilingues (FR/EN) — convention implicite, pas de standard unique.
4. Frontend plus strict TS que backend — incohérence de typage acceptée pour l'instant.
5. Couverture de tests très faible (2 fichiers spec) — signaler les tests manquants seulement pour les changements comportementaux significatifs.
