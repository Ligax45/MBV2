# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Principal — cuisinier maison.** Consulte des recettes pour cuisiner au quotidien, crée et enrichit ses propres fiches, et s’appuie sur une structure claire (ingrédients quantifiés, étapes, équipement) plutôt que sur du texte libre.

**Secondaire — communauté.** Découvre la bibliothèque partagée, publie des recettes et interagit avec le contenu des autres utilisateurs (favoris, modération — voir capacités confirmées dans le code).

Interface et messages métier en **français**.

## Product Purpose

MiamBook est une bibliothèque de recettes de cuisine qui permet de **consulter**, **créer** et **organiser** des fiches détaillées, avec un parcours de **cuisine guidée** pendant la préparation.

Succès produit : l’utilisateur retrouve une recette rapidement, comprend quoi faire et avec quoi, puis suit les étapes sans friction — surtout sur mobile, où l’app est pensée en premier.

## Positioning

MiamBook combine deux mécanismes différenciants :

1. **Fiches très structurées** — ingrédients avec quantité et unité, étapes ordonnées, équipement listé ; la précision et la reproductibilité priment sur une simple note de cuisine.
2. **Expérience de cuisine guidée** — mode cuisson pas-à-pas (écran dédié hors shell principal) pour suivre la recette les mains occupées.

Ce n’est pas un simple carnet de notes ni un flux social générique : c’est un outil de cuisine structuré, utilisable seul ou au sein d’une bibliothèque partagée.

## Operating Context

- **Usage typique** : en cuisine (mobile), à la maison pour préparer un repas ; consultation rapide de la bibliothèque ou de « Mes recettes » ; création/édition de fiches quand on n’est pas en train de cuisiner.
- **Environnement technique** : mono-repo `MBV2` — frontend Angular 21 (port 4200), API NestJS (port 3333), PostgreSQL via Supabase ; proxy dev `/api` → backend.
- **Mode démo** : données bouchon locales (`useMockData: true`) sans base ; bascule API réelle via `environment.development.ts`.
- **Thème** : clair / sombre, persistance `localStorage` (`miambook-theme`).

## Capabilities and Constraints

### Confirmé (implémenté ou en cours dans le dépôt)

- Bibliothèque de recettes avec recherche (`/bibliotheque`)
- Détail recette : ingrédients, étapes, équipement (`/recette/:recipeId`)
- Création de recette (`/createRecipe`, authentification requise)
- « Mes recettes » — recettes de l’utilisateur connecté (`/bibliotheque/mes-recettes`)
- Authentification JWT (login, tokens `miambook_*` en `localStorage`)
- Mode cuisson guidé (`recipe-cooking-mode`, route dédiée hors layout shell)
- Administration utilisateurs et modération (modules présents)
- Favoris (filtre API `?favorites=true`)
- Thème clair / sombre
- Layout **mobile-first** : sidebar desktop (≥ 768px), menu mobile drawer
- Stack UI : Angular 21 standalone, PrimeNG, PrimeIcons, tokens SCSS (`frontend-angular/src/styles/`)

### Roadmap documentée (non engagée comme livré)

- Catégories de recettes
- Export PDF
- Partage et commentaires (aligné avec la dimension communauté)

### Contraintes techniques

- Mobile-first web ; pas d’app native iOS/Android dans ce dépôt.
- Validation métier côté API (pas de `ValidationPipe` global) ; erreurs métier en français.
- Pas de préfixe global Nest — routes `recipes`, `auth`, `admin`.

### Décisions ouvertes

- Périmètre exact de la dimension « communauté » (visibilité des recettes, modération, partage public) au-delà de la bibliothèque et des favoris déjà codés.
- Contenu et rôle de la page d’accueil (placeholder actuel).

## Brand Commitments

- **Nom** : MiamBook (projet repo : MiamBookV2).
- **Voix** : française, directe, orientée action en cuisine.
- **Identité visuelle existante** : palette et tokens « MiamBook » dans `frontend-angular/src/styles/tokens.scss` ; logo texte « MiamBook » dans le shell (topbar, sidebar, menu mobile). Pas de direction esthétique formalisée dans DESIGN.md à ce stade.

## Evidence on Hand

- README racine et `frontend-angular/README.md` — description fonctionnelle et stack.
- `docs/conventions.md` — conventions de code du mono-repo.
- Données bouchon : `frontend-angular/src/app/core/data/bouchon-*.ts` (16 recettes démo ; id `1` = fiche complète).
- Licence MIT, © Clement Farina.
- **À ne pas fabriquer** : témoignages, métriques d’usage, clients, pricing, déploiement production non documenté.

## Product Principles

1. **Structure avant prose** — une recette doit être actionnable : quantités, ordre des étapes, équipement explicites.
2. **Mobile d’abord en cuisine** — parcours critique (consulter, suivre, avancer d’une étape) optimisé pour le téléphone en situation réelle.
3. **Ma bibliothèque et la communauté** — l’utilisateur possède ses recettes tout en pouvant explorer et contribuer à une bibliothèque partagée.
4. **Guidage pendant l’acte** — le mode cuisson est un produit à part entière, pas un détail du détail recette.
5. **Honnêteté du périmètre** — distinguer ce qui est livré, en cours et sur la roadmap ; ne pas promettre PDF, catégories ou commentaires tant qu’ils ne sont pas livrés.

## Accessibility & Inclusion

- Interface en français ; libellés et navigation cohérents avec les routes existantes.
- Icônes PrimeIcons avec `aria-hidden` là où le texte adjacent porte le sens (convention observée dans le README frontend).
- Pas de norme d’accessibilité (WCAG niveau) explicitement fixée par le produit à ce jour — à préciser si un niveau devient une exigence.
