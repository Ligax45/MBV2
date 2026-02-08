# MiamBookV2

MiamBookV2 est une **bibliothèque de recettes de cuisine** moderne, qui permet aux utilisateurs de créer, organiser et suivre leurs propres recettes. Chaque recette peut contenir **des ingrédients détaillés** et des **étapes de préparation personnalisées**.

---

## 🏗️ Stack technique

- **Frontend** : React + TypeScript + Vite + shadcn (UI moderne et composants réutilisables)
- **Backend** : NestJS (API RESTful pour gérer les recettes, ingrédients et étapes)
- **Gestion des dépendances** : npm
- **Architecture** : Front et Back séparés, mono-repo

---

## 📁 Structure du projet

MiamBookV2/
├── frontend/ ← Application React
│ ├── package.json
│ ├── tsconfig.json
│ ├── vite.config.ts
│ ├── src/
│ └── node_modules/
├── backend/ ← API NestJS
│ ├── package.json
│ ├── tsconfig.json
│ ├── src/
│ └── node_modules/
├── .gitignore
└── README.md

---

## ⚡ Fonctionnalités

- Créer, modifier et supprimer des recettes
- Ajouter des ingrédients avec quantité et unité
- Définir des étapes de préparation pour chaque recette
- Interface réactive et moderne avec **shadcn UI**
- API backend sécurisée et évolutive avec **NestJS**

## 🧰 Technologies utilisées

- **React** pour l’interface utilisateur
- **TypeScript** pour un code typé et sécurisé
- **shadcn UI** pour des composants modernes
- **Vite** pour un dev server rapide et une compilation optimisée
- **NestJS** pour l’API backend modulaire et testable

---

## 📈 Roadmap

- Authentification des utilisateurs
- Gestion des catégories de recettes
- Possibilité d’exporter des recettes en PDF
- Fonctionnalité de partage et commentaires

---

## 🚀 Installation & lancement

### Prérequis

- Node.js >= 22.x
- npm >= 9.x

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le front sera disponible sur : http://localhost:5173

### Backend

```bash
cd backend
npm install
npm run start:dev
```

L’API sera disponible sur : http://localhost:3000

---

## 📄 Licence

Ce projet est distribué sous la licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.  
© 2025 Clement Farina
