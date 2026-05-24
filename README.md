# MiamBookV2

MiamBookV2 est une **bibliothèque de recettes de cuisine** moderne : créer, organiser et suivre ses recettes, avec **ingrédients détaillés** et **étapes de préparation**.

---

## Stack technique

| Couche | Technologies |
|--------|----------------|
| **Frontend** | Angular 21, TypeScript, PrimeNG, PrimeIcons |
| **Backend** | NestJS, API REST |
| **Base de données** | PostgreSQL sur Supabase (MikroORM) |
| **Gestion des paquets** | npm |
| **Architecture** | Mono-repo — frontend et backend séparés |

---

## Structure du projet

```
MiamBookV2/
├── frontend-angular/     # Application Angular (UI)
├── backend/              # API NestJS + migrations PostgreSQL
├── LICENSE
└── README.md
```

Documentation détaillée :

- [Frontend Angular](frontend-angular/README.md)
- [Backend NestJS](backend/README.md)

---

## Fonctionnalités

- Créer, consulter et gérer des recettes
- Ingrédients avec quantité et unité
- Étapes de préparation par recette
- Bibliothèque avec recherche
- Détail recette (ingrédients, étapes, équipement)
- Thème clair / sombre
- API modulaire et évolutive (NestJS)

---

## Prérequis

- **Node.js** 20+ (LTS recommandé)
- **npm** 9+
- Compte **Supabase** (PostgreSQL managé) pour le backend

---

## Installation et lancement

### 1. Base de données et API

```bash
cd backend
npm install
```

Copier `backend/.env.example` vers `backend/.env`, renseigner la connexion **Supabase** (voir [backend/README.md](backend/README.md)), puis appliquer les migrations :

```bash
npm run migration:up
npm run start:dev
```

API : [http://localhost:3333](http://localhost:3333)  
Santé : `GET /health` — Recettes : `GET /recipes`, `GET /recipes/:id`, `POST /recipes`

### 2. Frontend Angular

```bash
cd frontend-angular
npm install
npm start
```

Application : [http://localhost:4200](http://localhost:4200)

En développement, le proxy Angular redirige `/api` vers le backend (`proxy.conf.json` → port **3333**).

### Frontend et API

Le frontend appelle l’API via le proxy (`/api` → port 3333).  
Pour repasser en mode démo hors-ligne : `useMockData: true` dans `frontend-angular/src/environments/environment.development.ts` (fichiers `core/data/bouchon-*.ts` conservés).

---

## Roadmap

- Authentification utilisateurs
- Catégories de recettes
- Export PDF
- Partage et commentaires

---

## Licence

Projet sous licence **MIT**. Voir [LICENSE](LICENSE).  
© 2025 Clement Farina
