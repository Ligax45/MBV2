---
name: MiamBook
description: Bibliothèque de recettes chaleureuse, structurée et mobile-first — cuisine guidée incluse.
colors:
  primary: "#ff9800"
  primary-foreground: "#ffffff"
  background: "#fff9f5"
  foreground: "#2d1b13"
  secondary: "#7a5c46"
  accent: "#fef3e2"
  accent-foreground: "#2d1b13"
  muted: "#f3e8d9"
  muted-foreground: "#9a7b6a"
  placeholder-foreground: "#7c746e"
  border: "#f3e8d9"
  ring: "#f59e0b"
  card: "#ffffff"
  sidebar-bg: "#1e1713"
  sidebar-foreground: "#ffffff"
  sidebar-text: "#9b9691"
  sidebar-text-active: "#cf895c"
  sidebar-active-bg: "#3e271c"
  sidebar-logo-accent: "#e85d33"
  favorite-text: "#e11d48"
  favorite-bg: "#fff1f2"
  favorite-border: "#fecdd3"
  favorite-inactive-bg: "#fff5ed"
  favorite-inactive-text: "#c2410c"
  favorite-inactive-border: "#f0d4b8"
  meta-type-bg: "#ffedd5"
  meta-type-text: "#c2410c"
  meta-servings-bg: "#fde8d4"
  meta-servings-text: "#9a3412"
  meta-prep-bg: "#dcfce7"
  meta-prep-text: "#166534"
  meta-cook-bg: "#fef3c7"
  meta-cook-text: "#b45309"
  overlay-scrim: "rgb(0 0 0 / 50%)"
  badge-easy-bg: "#dcfce7"
  badge-easy-text: "#166534"
  badge-medium-bg: "#ffedd5"
  badge-medium-text: "#c2410c"
  badge-hard-bg: "#fee2e2"
  badge-hard-text: "#b91c1c"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  instruction:
    fontFamily: "'DM Sans', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  md: "0.75rem"
  default: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  pill: "9999px"
  sidebar-nav: "0.625rem"
spacing:
  xs: "0.375rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  page-mobile: "1.25rem 1rem"
  page-desktop: "2rem 2.5rem"
  touch-target-min: "2.75rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "color-mix(in srgb, {colors.primary} 88%, #000)"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1rem"
    height: "3rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "inherit"
    rounded: "{rounded.md}"
    padding: "0"
    size: "2.75rem"
  button-nav-cta:
    backgroundColor: "{colors.sidebar-logo-accent}"
    textColor: "#ffffff"
    rounded: "{rounded.sidebar-nav}"
    padding: "0 0.875rem"
    height: "2.625rem"
  input-search:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1rem 0.75rem 2.5rem"
  card-recipe:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.25rem"
---

# Design System: MiamBook

## Overview

**Creative North Star : « Le carnet du four doux »**

MiamBook ressemble à un carnet de cuisine posé sur le plan de travail : fond crème chaud, encre chocolat, touches d'orange vif au bon moment. L'interface est **mobile-first** — pensée pour le téléphone en cuisine — avec une coquille sombre stable (sidebar/topbar) et un contenu lumineux, aéré, structuré. La paire **Playfair Display + DM Sans** donne du caractère éditorial aux titres de recettes sans sacrifier la lisibilité des listes et des instructions.

Le système privilégie la **clarté opérationnelle** : grands boutons tactiles, texte d'instruction généreux en mode cuisson, barres d'action toujours visibles. L'expression visuelle reste domestique et chaleureuse, jamais clinique ni « dashboard SaaS ».

**Key Characteristics:**

- Palette crème-chocolat-orange, chaleur avant froideur
- Typographie éditoriale pour les titres, sans pour le corps et les labels
- Coins généreusement arrondis ; pilules pour CTAs, filtres et champs de recherche
- Profondeur par élévation légère au survol, pas par empilement de bordures
- Shell navigation sombre persistant ; contenu en zone claire scrollable
- Thème clair/sombre via `html.light` / `html.dark` + classe `.dark` sur les tokens sémantiques
- Mode cuisson immersif hors shell, optimisé `100dvh` et safe areas iOS

## Colors

Une palette **chaude et domestique** : fonds crème, texte brun profond, orange comme accent d'action, sidebar espresso pour l'ancrage.

### Primary

- **Orange MiamBook** (`#ff9800`) : action principale — boutons « Suivant », puces d'étape, avatar fallback, focus des champs PrimeNG. Rare sur une même vue : il signale « fais avancer ».
- **Blanc sur orange** (`#ffffff`) : texte et icônes sur fond primary.

### Secondary

- **Brun secondaire** (`#7a5c46`) : métadonnées, sous-titres, liens de retour, texte de navigation secondaire en mode cuisson.
- **Accent crème** (`#fef3e2`) : survol ghost, fond de filtre actif léger, zones de surbrillance douce.

### Tertiary

- **Corail logo** (`#e85d33`) : CTA sidebar « Créer une recette », pastille logo — plus chaud et plus saturé que le primary ; réservé à la création et à l'identité shell.
- **Ambre focus** (`#f59e0b`) : anneau `:focus-visible` (`--ring`) et étoiles de notation ; ne remplace pas le primary pour les actions.

### Neutral

- **Crème fond** (`#fff9f5`) : fond de page et zones de contenu en thème clair.
- **Chocolat texte** (`#2d1b13`) : corps, titres, texte sur fond clair.
- **Beige muted** (`#f3e8d9`) : bordures légères, fonds de placeholder image, chips de progression.
- **Taupe atténué** (`#9a7b6a`) : texte secondaire, icônes décoratives.
- **Carte blanche** (`#ffffff`) : surfaces de carte, header mode cuisson, champs.
- **Sidebar espresso** (`#1e1713`) : sidebar desktop, topbar mobile — ancrage sombre constant entre thèmes clair et sombre.

### Sémantiques (badges, favoris & métadonnées)

- **Difficulté** : vert (`#dcfce7` / `#166534`), orange (`#ffedd5` / `#c2410c`), rouge (`#fee2e2` / `#b91c1c`) — tokens `--badge-easy-*`, `--badge-medium-*`, `--badge-hard-*`.
- **Favoris actif** : rose (`#fff1f2` fond, `#e11d48` texte, `#fecdd3` bordure).
- **Favoris inactif** : pêche (`#fff5ed` fond, `#c2410c` texte, `#f0d4b8` bordure) — hover carte et état non favori.
- **Pastilles métadonnées détail** (`--meta-*`) : type (orange badge), portions (pêche), préparation (vert), cuisson (ambre) — remappées en `.dark` via `color-mix` sur `--card`.

### Thème sombre

La classe `.dark` sur `html` recalcule fond (`#1a100a`), carte (`#231810`), bordures (`rgb(255 255 255 / 10%)`) et pastilles `--meta-*`. La sidebar espresso reste inchangée entre thèmes — ancrage visuel constant.

### Named Rules

**La règle du orange rare.** Le primary orange apparaît sur les actions qui font progresser (CTA de navigation d'étape, puces numérotées, submit). Le corail logo (`--sidebar-logo-accent`) est réservé à la création et au branding shell. Ne pas diluer ces deux accents sur chaque contrôle.

**La règle du contraste placeholder.** `--placeholder-foreground` est calibré pour AA 4.5:1 sur `--card` et fonds clairs — ne pas le remplacer par `--muted-foreground` dans les champs.

## Typography

**Display Font:** Playfair Display (Georgia, serif)  
**Body Font:** DM Sans (system-ui, sans-serif)  
**Label/Mono Font:** DM Sans pour les labels ; `ui-monospace` uniquement pour les codes MFA

**Character:** Playfair apporte la personnalité « recette de famille » sur les titres ; DM Sans assure la scanabilité des listes, filtres et instructions. Le contraste serif/sans est le signature typographique du produit.

### Hierarchy

- **Display** (700, ~1.75rem titre recette, line-height 1.2) : titres de fiches recette, titres de cartes (1.0625rem).
- **Headline** (700, 2rem, letter-spacing -0.02em) : titres de page (Bibliothèque, Modération).
- **Title** (600–700, 1.25–1.5rem) : titres d'étape mode cuisson, titres de cartes auth.
- **Body** (400, 1rem, line-height 1.5) : paragraphes, sous-titres de page, métadonnées standard.
- **Instruction** (400, 1.125rem mobile / 1.25rem desktop, line-height 1.6, `white-space: pre-line`) : contenu d'étape en mode cuisson — taille minimale non négociable en cuisine.
- **Label** (500, 0.875rem) : labels de formulaire, filtres, badges, boutons secondaires.

### Named Rules

**La règle Playfair ciblée.** Playfair Display uniquement sur les titres de recettes et en-têtes éditoriaux. Jamais sur les paragraphes d'instruction, les listes d'ingrédients ou la navigation — DM Sans y garde la lisibilité.

## Layout

**Modèle spatial :** shell fixe `100dvh` + zone principale scrollable (`flex: 1; min-height: 0; overflow: auto`). Mobile d'abord : une colonne, padding réduit (`1.25rem 1rem`), sidebar masquée, drawer menu. À partir de **768px** (`--breakpoint-md`) : sidebar fixe `15rem`, contenu décalé `margin-left: var(--sidebar-width)`, padding `2rem 2.5rem`.

**Conteneurs de page :** bibliothèque `max-width: 75rem` ; détail recette `max-width: 56rem` ; mode cuisson contenu centré `max-width: 40rem` sur tablette+.

**Grilles :** `repeat(auto-fill, minmax(18rem, 1fr))` pour les cartes recettes ; hero détail 1 colonne → 2 colonnes (`1fr 1.1fr`) à 768px.

**Safe areas :** `env(safe-area-inset-top/bottom)` sur headers et barres d'action fixes (mode cuisson).

**Named Rules**

**La règle min-height: 0.** Tout enfant flex scrollable (`.app-main`, `.cooking-mode__content`) doit avoir `min-height: 0` — sinon le scroll casse et les barres d'action disparaissent hors écran.

**La règle mobile-first stricte.** Styles par défaut pour 320–390px ; améliorations desktop via `@media (min-width: 768px)` uniquement. Jamais l'inverse.

## Elevation & Depth

Système **hybride tonal + ombre légère**. Au repos, les surfaces sont plates ou séparées par `--border` / `--muted`. Les ombres apparaissent comme **réponse à l'état** (survol carte, barre d'action fixe, bottom sheet) — jamais comme décor permanent.

### Shadow Vocabulary

- **Carte au repos** (`0 2px 12px rgb(45 27 19 / 6%)`) : `p-card` PrimeNG en thème clair.
- **Carte au survol** (`0 8px 24px rgb(45 27 19 / 10%)` + `translateY(-4px)`) : cartes bibliothèque.
- **Barre d'action fixe** (`0 -4px 12px rgb(45 27 19 / 6%)`) : navigation bas mode cuisson.
- **Bottom sheet** (`0 -10px 15px -3px rgb(0 0 0 / 12%), 0 -4px 6px -4px rgb(0 0 0 / 8%)`) : panneau ingrédients.
- **Overlay** (`--overlay-scrim`, `rgb(0 0 0 / 50%)`) : fond modal/drawer/mobile menu, z-index 40.
- **Élévation générique** (`--shadow-elevated`) : `0 8px 24px color-mix(foreground 10%, transparent)` — modales, popovers.

### Named Rules

**La règle flat-by-default.** Pas d'ombre sur les boutons ou champs au repos. L'élévation signale l'interaction (hover carte) ou la hiérarchie temporaire (sheet, barre fixe).

## Shapes

Langage de formes **doux et domestique** : coins arrondis généreux, pilules pour tout ce qui est tactile ou filtrant.

- **Rayon standard** (`--radius` 1rem) : usage général.
- **Rayon medium** (`--radius-md` 0.75rem) : boutons ghost, icônes header cuisson, petits contrôles.
- **Rayon large** (`--radius-lg` 1.5rem) : cartes PrimeNG, blocs d'instruction, coins supérieurs bottom sheet.
- **Rayon XL** (`--radius-xl` 2rem) : images hero détail recette.
- **Pilule** (`--radius-pill` / `9999px`) : CTAs primaires, filtres bibliothèque, champs recherche, badges difficulté.
- **Cercle** : pastilles logo, boutons like carte, numéros d'étape, avatars.

Bordures fines `1px solid var(--border)` pour séparer sans alourdir. Pas de coins droits sur les composants interactifs principaux.

## Components

### Buttons

- **Shape :** pilule pour actions primaires/secondaires en contexte cuisine ; `0.75rem` pour ghost/icon ; `0.625rem` pour nav sidebar.
- **Primary :** fond `--primary`, texte blanc, `min-height: 3rem` (48px+), font-weight 600, hover `color-mix(88% primary, black)`.
- **Secondary :** fond `--background`, bordure `--border`, texte `--secondary`, même hauteur tactile.
- **Ghost / Icon :** `.btn-ghost` transparent, hover `--accent` ; `.btn-icon` `var(--touch-target-min)` (2.75rem / 44px) carré.
- **Nav CTA :** corail `--sidebar-logo-accent`, centré, séparé du reste par divider sidebar.
- **Hover / Focus :** transitions 0.15s ; `:focus-visible` outline 2px `color-mix(50% --ring, transparent)` offset 2px.

### Chips / Filtres

- **Style :** pilule, bordure `--border`, fond `--background`, label 0.875rem weight 500.
- **État actif favoris :** fond `--favorite-bg`, bordure `--favorite-border`, texte `--favorite-text`.
- **État actif type :** teinte primary 12% sur fond, bordure primary 45%.
- **État actif « Tous » :** fond `--foreground`, texte `--background` (inversion forte).

### Cards / Containers

- **Corner Style :** `--radius-lg` (1.5rem) via PrimeNG override.
- **Background :** `--card` sur fond `--background`.
- **Shadow Strategy :** ombre légère au repos ; lift au hover (cartes recettes).
- **Border :** aucune bordure carte au repos ; footer séparé par `1px solid --border`.
- **Internal Padding :** body `1rem 1.25rem`, footer `0.75rem 1.25rem`.
- **Média carte :** ratio 16/10, image zoom 1.04 au hover.

### Inputs / Fields

- **Style :** fond `--card`, bordure `--border`, pilule (`--radius-pill`), padding avec espace icône gauche.
- **Focus :** bordure `--primary`, glow `0 0 0 2px rgb(245 158 11 / 15%)`.
- **Placeholder :** `--placeholder-foreground` (AA sur card).
- **Erreur auth :** `#dc2626` (hors tokens — usage localisé formulaires).

### Navigation

- **Sidebar desktop :** fond `--sidebar-bg`, liens `.btn-nav` hauteur 2.625rem, texte `--sidebar-text`, actif `--sidebar-active-bg` + `--sidebar-text-active`.
- **Topbar mobile :** même fond sombre, logo corail + titre Georgia, visible < 768px uniquement.
- **Mobile menu :** drawer overlay `--overlay-scrim`, z-index 40/50, `role="dialog"`, focus trap CDK, `inert` sur shell, Échap pour fermer.
- **Theme toggle :** bouton icône dans topbar/sidebar, bascule `html.light` / `html.dark` via `ThemeService` + `localStorage`.

### Badges difficulté

- **Style :** pilule compacte, 0.75rem weight 500, couleurs sémantiques vert/orange/rouge.
- **Usage :** métadonnée recette uniquement — pas pour actions.

### Pastilles métadonnées (détail recette)

- **Style :** pilule compacte, fond/texte via `--meta-type-*`, `--meta-servings-*`, `--meta-prep-*`, `--meta-cook-*`.
- **Usage :** ligne d'info sous le titre (type, portions, temps) — distinct des badges difficulté.

### Mode cuisson (signature)

- **Écran immersif** hors layout shell, `100dvh`, header `--card` + barre nav fixe bas.
- **Instruction :** bloc `--card` bordé, `--radius-lg`, texte 1.125rem+ line-height 1.6.
- **Bottom sheet ingrédients :** `max-height: 70dvh`, coins sup `--radius-lg`, overlay 50%.

## Do's and Don'ts

### Do:

- **Do** utiliser les variables CSS de `tokens.scss` (`--primary`, `--background`, `--card`, `--radius-*`) — pas de couleurs magiques sauf badges sémantiques déjà tokenisés.
- **Do** utiliser `var(--touch-target-min)` (2.75rem / 44px) pour les boutons icône et contrôles tactiles secondaires ; `min-height: 3rem` (48px+) pour les CTAs primaires.
- **Do** respecter `prefers-reduced-motion: reduce` — les transitions globales sont neutralisées dans `base.scss`.
- **Do** appliquer Playfair Display aux titres de recettes et DM Sans au reste.
- **Do** tester à 320px : barres d'action visibles, scroll sans masquer les contrôles fixes.
- **Do** respecter `100dvh` + safe areas sur les écrans immersifs (mode cuisson).
- **Do** utiliser PrimeNG pour composants complexes, avec overrides dans `primeng-overrides.scss` (clair et `.dark`).
- **Do** charger les images recettes via `NgOptimizedImage` + `recipeImageLoader` pour les URLs Supabase.

### Don't:

- **Don't** écrire du CSS desktop-first puis rétrograder avec `max-width` — mobile est le défaut.
- **Don't** mettre Playfair sur les instructions de cuisine ou les listes d'ingrédients.
- **Don't** empiler ombres et bordures lourdes au repos — la profondeur répond à l'état.
- **Don't** sortir le primary orange sur plus de 2–3 éléments d'action par écran.
- **Don't** hardcoder des gris ou bleus génériques — la palette est chaude et brun-orangée.
- **Don't** laisser le contenu long pousser les barres d'action hors viewport en mode cuisson.
