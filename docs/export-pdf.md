# Export PDF recette — guide d'implémentation

Document de référence pour implémenter l'export PDF d'une recette MiamBook.
**La génération du PDF est entièrement côté backend** (NestJS + pdfmake).
Le frontend Angular ne génère rien : il appelle l'API, affiche le PDF dans une modal et propose le téléchargement.

Aligné avec l'epic **Export PDF** du kanban Notion MiamBook et le périmètre `PRODUCT.md` (roadmap, non livré à ce jour).

---

## Décisions produit

| Sujet | Décision |
|-------|----------|
| Où générer le PDF | **Backend** (`backend/`) avec **pdfmake** |
| Où afficher / télécharger | **Frontend** (`frontend-angular/`) |
| Endpoint | `GET /recipes/:id/pdf` (proxy dev : `/api/recipes/:id/pdf`) |
| Auth | `OptionalJwtAuthGuard` + `canViewRecipe()` (mêmes règles que `GET /recipes/:id`) |
| Format | A4, lisible, imprimable |
| Contenu V1 | Titre, temps (prep / cuisson / repos), portions, ingrédients, étapes, équipement |
| Hors scope V1 | Image recette, branding avancé, portions dynamiques, export batch |
| Alternative reportée | Puppeteer / HTML→PDF (spike post-MVP si qualité ou image requise) |

### Tickets kanban associés

1. Spike lib → **décision : pdfmake côté serveur** (pas front, pas Puppeteer en V1)
2. Template PDF basique recette → builder backend
3. Service / use case génération PDF → `ExportRecipePdfUseCase`
4. Prévisualisation modal → frontend
5. Téléchargement fichier → frontend (`miambook-{slug}.pdf`)
6. Bouton page détail → frontend
7. Cas limites → tests manuels + tests unitaires builder
8. Décision post-MVP → réévaluer Puppeteer si image / rendu CSS nécessaire

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  recipe-details (Angular)                                       │
│    │                                                            │
│    ├─ Clic « Prévisualiser le PDF »                             │
│    │     └─ RecipeApiService.downloadRecipePdf(id)              │
│    │           GET /api/recipes/:id/pdf  (responseType: blob)   │
│    │                                                            │
│    ├─ Modal (app-dialog) + iframe blob: URL                     │
│    └─ Bouton « Télécharger » → <a download>                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  RecipeController                                               │
│    GET :id/pdf  (@UseGuards(OptionalJwtAuthGuard))              │
│      └─ ExportRecipePdfUseCase.execute(id, actor)               │
│            ├─ recipeRepo.findById + canViewRecipe                 │
│            ├─ buildRecipePdfDocument(recipe)  // pdfmake def      │
│            └─ renderPdfToBuffer(docDefinition)                  │
│                  → Buffer + filename                            │
└─────────────────────────────────────────────────────────────────┘
```

**Principe clé :** un seul pipeline PDF côté serveur. La prévisualisation et le téléchargement utilisent le **même blob** reçu de l'API.

---

## Backend (NestJS)

### Dépendances

```bash
cd backend
npm install pdfmake
npm install -D @types/pdfmake   # si nécessaire selon la version
```

pdfmake en Node utilise `PdfPrinter` (pas `pdfMake` du navigateur). Les polices Roboto par défaut (vfs) suffisent pour le français en V1.

### Fichiers à créer

```
backend/src/modules/recipe/
├── application/
│   ├── recipe-pdf-document.builder.ts   # Recipe → TDocumentDefinitions
│   ├── recipe-pdf.renderer.ts           # docDefinition → Buffer
│   ├── recipe-pdf-filename.util.ts      # slug pour Content-Disposition
│   └── use-cases/
│       └── export-recipe-pdf.usecase.ts
```

Enregistrer le use case dans `recipe.module.ts` et l'injecter dans `recipe.controller.ts`.

### Use case — `ExportRecipePdfUseCase`

Reprendre le même schéma que `GetRecipeByIdUseCase` :

1. Valider l'UUID (`BadRequestException` si invalide).
2. Charger la recette via `RECIPE_REPOSITORY.findById`.
3. Appliquer `canViewRecipe(actor, recipe)` — si refus → `NotFoundException('Recette introuvable')` (ne pas révéler l'existence d'une recette privée).
4. Construire `docDefinition` via `buildRecipePdfDocument(recipe)`.
5. Rendre en `Buffer` via `renderPdfToBuffer(docDefinition)`.
6. Retourner `{ buffer, filename }` où `filename` = `miambook-{slug}.pdf`.

```typescript
// export-recipe-pdf.usecase.ts (signature indicative)
export interface ExportRecipePdfResult {
  buffer: Buffer;
  filename: string;
  contentType: 'application/pdf';
}

@Injectable()
export class ExportRecipePdfUseCase {
  async execute(id: string, actor?: AuthenticatedUser): Promise<ExportRecipePdfResult>;
}
```

### Builder — contenu V1 du PDF

Mapper l'entité domaine `Recipe` (`domain/entities/recipe.entity.ts`) :

| Champ recette | Section PDF |
|---------------|-------------|
| `title` | Titre principal |
| `prepMinutes`, `cookMinutes`, `restMinutes` | Ligne méta (ex. « Préparation 20 min · Cuisson 35 min · Repos 10 min ») |
| `servings` | « Pour N personnes » |
| `recipeType.label` | Optionnel en sous-titre |
| `ingredients[]` | Liste à puces : `{quantity} {unit} {name}` |
| `steps[]` (triés par `order`) | Liste numérotée : `{order}. {title?} {content}` |
| `equipment[]` | Liste à puces des labels |
| — | Pied de page discret : « Généré par MiamBook » |

**Hors scope V1 :** `imageUrl`, `description` longue, notes utilisateur, favoris, notes communautaires.

Réutiliser la logique de formatage alignée sur le front (`formatMinutes`, ligne ingrédient) — soit dupliquer minimalement dans le builder backend, soit extraire des helpers purs sans dépendance Angular.

Exemple de structure pdfmake (indicatif) :

```typescript
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Recipe } from '../../domain/entities/recipe.entity';

export function buildRecipePdfDocument(recipe: Recipe): TDocumentDefinitions {
  return {
    pageSize: 'A4',
    pageMargins: [40, 56, 40, 56],
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.35 },
    content: [
      { text: recipe.title, style: 'title' },
      { text: formatRecipeTimesLine(recipe), style: 'meta' },
      { text: `Pour ${recipe.servings} personne${recipe.servings > 1 ? 's' : ''}`, style: 'meta' },
      { text: 'Ingrédients', style: 'section' },
      {
        ul: recipe.ingredients
          .slice()
          .sort((a, b) => a.position - b.position)
          .map(formatIngredientLine),
      },
      { text: 'Étapes', style: 'section' },
      {
        ol: recipe.steps
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(formatStepLine),
      },
      { text: 'Équipement', style: 'section' },
      { ul: recipe.equipment.map((e) => e.label) },
      { text: 'Généré par MiamBook', style: 'footer', margin: [0, 24, 0, 0] },
    ],
    styles: {
      title: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
      meta: { fontSize: 10, color: '#555555', margin: [0, 0, 0, 4] },
      section: { fontSize: 13, bold: true, margin: [0, 16, 0, 8] },
      footer: { fontSize: 9, color: '#888888', alignment: 'center' },
    },
  };
}
```

### Renderer — Buffer Node

```typescript
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

// Polices : charger Roboto depuis pdfmake/build/vfs_fonts ou chemins fichiers.
// Voir la doc pdfmake « Server-side».

export function renderPdfToBuffer(doc: TDocumentDefinitions): Promise<Buffer> {
  const printer = new PdfPrinter(fonts);
  const pdfDoc = printer.createPdfKitDocument(doc);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}
```

### Nom de fichier — `recipe-pdf-filename.util.ts`

```typescript
export function buildRecipePdfFilename(title: string): string {
  const slug = slugifyRecipeTitle(title); // minuscules, sans accents, tirets
  return `miambook-${slug}.pdf`;
}

function slugifyRecipeTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'recette';
}
```

### Controller — endpoint et headers

**Important :** déclarer `@Get(':id/pdf')` **avant** `@Get(':id')` dans `recipe.controller.ts`, sinon Nest matche `:id` en premier.

```typescript
@Get(':id/pdf')
@UseGuards(OptionalJwtAuthGuard)
async exportPdf(
  @Param('id') id: string,
  @CurrentUser() user?: AuthenticatedUser,
  @Res({ passthrough: false }) res: Response,
) {
  const { buffer, filename } = await this.exportRecipePdf.execute(id, user);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}
```

| Header | Valeur | Rôle |
|--------|--------|------|
| `Content-Type` | `application/pdf` | Type MIME |
| `Content-Disposition` | `inline; filename="miambook-….pdf"` | Prévisualisation iframe + nom suggéré au download |
| `Content-Length` | taille du buffer | Optionnel, utile pour le client |

Ne pas renvoyer de JSON sur cette route. Les erreurs restent le format Nest habituel (404, 400).

### Tests backend (recommandés)

| Fichier | Cible |
|---------|-------|
| `recipe-pdf-document.builder.spec.ts` | Structure du document (sections, tri ingrédients/étapes, accents FR) |
| `recipe-pdf-filename.util.spec.ts` | Slug et nom fichier |
| `export-recipe-pdf.usecase.spec.ts` | Auth : recette privée → 404 pour utilisateur non autorisé |

Test manuel : `curl -H "Authorization: Bearer …" http://localhost:3333/recipes/{uuid}/pdf --output test.pdf`

---

## Frontend (Angular)

Le frontend **ne contient pas pdfmake**. Il consomme l'endpoint binaire et gère l'UX.

### Fichiers à créer / modifier

```
frontend-angular/src/app/
├── core/
│   ├── services/recipe-api.service.ts          # + downloadRecipePdf()
│   └── utils/recipe-pdf-download.util.ts       # triggerDownload(blob, filename)
└── features/recipe-details/
    ├── recipe-details.component.ts/html/scss   # bouton + état modal
    └── components/recipe-pdf-preview/            # optionnel : modal dédiée
        ├── recipe-pdf-preview.component.ts
        ├── recipe-pdf-preview.component.html
        └── recipe-pdf-preview.component.scss
```

Réutiliser le wrapper existant `@shared/components/app-dialog/app-dialog.component` (PrimeNG `p-dialog`).

### API service

```typescript
// recipe-api.service.ts
downloadRecipePdf(id: string): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/recipes/${id}/pdf`, {
    responseType: 'blob',
  });
}
```

L'`authInterceptor` ajoute automatiquement le Bearer token — nécessaire pour les recettes privées de l'utilisateur connecté.

**Gestion d'erreur :** si le backend renvoie du JSON (404/403) avec `responseType: 'blob'`, le corps est un Blob texte. Parser en cas d'échec :

```typescript
// indicative — dans le composant ou un helper
if (error.error instanceof Blob && error.error.type.includes('json')) {
  const text = await error.error.text();
  const body = JSON.parse(text);
  // afficher body.message via AlertService
}
```

### Flux UX (page détail `/recette/:recipeId`)

1. Bouton **« Prévisualiser le PDF »** dans la zone actions (`recipe-details.component.html`).
2. Clic → `generatingPdf = true` → appel API → réception `Blob`.
3. `URL.createObjectURL(blob)` → affichage dans modal.
4. Modal : iframe + boutons **« Télécharger »** et **« Fermer »**.
5. Fermeture → `URL.revokeObjectURL()` pour libérer la mémoire.

### Composant modal (pattern)

```typescript
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

protected readonly pdfPreviewVisible = signal(false);
protected readonly generatingPdf = signal(false);
protected readonly pdfBlob = signal<Blob | null>(null);
protected readonly pdfPreviewUrl = signal<SafeResourceUrl | null>(null);

private pdfObjectUrl: string | null = null;
private readonly sanitizer = inject(DomSanitizer);
private readonly recipeApi = inject(RecipeApiService);
private readonly alertService = inject(AlertService);

protected async openPdfPreview(): Promise<void> {
  const id = this.recipeId();
  if (!id || this.generatingPdf()) return;

  this.generatingPdf.set(true);
  try {
    const blob = await firstValueFrom(this.recipeApi.downloadRecipePdf(id));
    this.pdfBlob.set(blob);
    this.pdfObjectUrl = URL.createObjectURL(blob);
    this.pdfPreviewUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfObjectUrl),
    );
    this.pdfPreviewVisible.set(true);
  } catch {
    this.alertService.error('Impossible de générer le PDF.');
  } finally {
    this.generatingPdf.set(false);
  }
}

protected closePdfPreview(): void {
  if (this.pdfObjectUrl) {
    URL.revokeObjectURL(this.pdfObjectUrl);
    this.pdfObjectUrl = null;
  }
  this.pdfPreviewUrl.set(null);
  this.pdfBlob.set(null);
  this.pdfPreviewVisible.set(false);
}

protected downloadPdf(): void {
  const blob = this.pdfBlob();
  const recipe = this.recipe();
  if (!blob || !recipe) return;
  downloadBlobAsFile(blob, buildClientPdfFilename(recipe.title));
}
```

```html
<app-dialog
  title="Prévisualisation"
  [(visible)]="pdfPreviewVisible"
  [width]="'min(95vw, 48rem)'"
  (visibleChange)="onPdfPreviewVisibleChange($event)"
>
  @if (generatingPdf()) {
    <p class="recipe-pdf-preview__loading" role="status">Génération du PDF…</p>
  } @else if (pdfPreviewUrl(); as url) {
    <iframe
      class="recipe-pdf-preview__frame"
      [src]="url"
      title="Prévisualisation de la recette"
    ></iframe>
  }

  <div appDialogFooter class="recipe-pdf-preview__actions">
    <p-button label="Fermer" severity="secondary" (onClick)="closePdfPreview()" />
    <p-button
      label="Télécharger"
      icon="pi pi-download"
      (onClick)="downloadPdf()"
      [disabled]="!pdfBlob()"
    />
  </div>
</app-dialog>
```

```scss
.recipe-pdf-preview__frame {
  width: 100%;
  height: min(70dvh, 42rem);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--card);
}
```

`DomSanitizer.bypassSecurityTrustResourceUrl` est **obligatoire** pour lier une URL `blob:` dynamique à `[src]`.

### Téléchargement côté client

```typescript
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

Le nom peut venir du header `Content-Disposition` (parser côté client) ou être recalculé avec la même règle que le backend (`miambook-{slug}.pdf`). En V1, recalculer côté front à partir du titre affiché est acceptable si la règle de slug est documentée (idéalement partagée via test snapshot identique).

### Accessibilité

- Bouton déclencheur : `aria-label="Prévisualiser le PDF de la recette"`.
- Pendant la génération : `aria-busy="true"` sur le bouton ou spinner avec `role="status"`.
- Modal : gérée par PrimeNG (`role="dialog"`, `aria-modal`).
- iframe : attribut `title` explicite.

### Mobile (iOS Safari)

- L'iframe peut ne pas afficher le PDF : prévoir un fallback « Ouvrir dans un nouvel onglet » (`window.open(pdfObjectUrl)`).
- Le téléchargement direct est parfois remplacé par l'ouverture du viewer natif — comportement attendu, pas un bug backend.

---

## Cas limites (checklist QA)

Tester avec la recette bouchon `id = 1` (fiche complète) et des cas synthétiques :

| Scénario | Attendu |
|----------|---------|
| Recette publique approuvée, utilisateur anonyme | PDF OK |
| Recette privée, auteur connecté | PDF OK |
| Recette privée, autre utilisateur | 404 |
| 20 ingrédients, 15 étapes | Pagination correcte, pas de texte tronqué |
| Accents FR (`crème`, `œufs`, apostrophes) | Rendu correct |
| Recette sans équipement | Section vide ou omise (choix produit à figer) |
| Viewport mobile 320px | Génération API OK ; modal utilisable |
| Double clic rapide sur le bouton | Pas de double requête (désactiver pendant `generatingPdf`) |

---

## Ordre d'implémentation suggéré

```
1. backend: recipe-pdf-document.builder + tests unitaires
2. backend: recipe-pdf.renderer + export-recipe-pdf.usecase
3. backend: route GET :id/pdf + test curl
4. frontend: RecipeApiService.downloadRecipePdf()
5. frontend: modal prévisualisation + téléchargement
6. frontend: bouton sur recipe-details
7. QA cas limites (desktop + mobile)
```

---

## Évolutions post-V1 (non engagées)

| Besoin | Piste |
|--------|-------|
| Photo dans le PDF | Backend : fetch `imageUrl` (Supabase) + pdfmake `image` ; ou migration Puppeteer |
| Mise en page identique au site | Template HTML + Puppeteer / Playwright |
| Cache PDF | Stocker dans Supabase Storage, URL signée |
| Export favoris / batch | Job async backend |
| Watermark / branding | CSS print (Puppeteer) ou styles pdfmake enrichis |

Le ticket Notion « Décision post-MVP — garder pdfmake ou migrer Puppeteer » reste pertinent **après** livraison de cette V1 backend.

---

## Références code existant

| Élément | Fichier |
|---------|---------|
| Modèle domaine recette | `backend/src/modules/recipe/domain/entities/recipe.entity.ts` |
| Autorisation lecture | `backend/src/modules/recipe/application/recipe-authorization.util.ts` |
| Détail recette (use case) | `backend/src/modules/recipe/application/use-cases/get-recipe-by-id.usecase.ts` |
| Controller recettes | `backend/src/modules/recipe/presentation/recipe.controller.ts` |
| Modèle UI détail | `frontend-angular/src/app/core/models/recipe-detail.model.ts` |
| API HTTP recettes | `frontend-angular/src/app/core/services/recipe-api.service.ts` |
| Page détail | `frontend-angular/src/app/features/recipe-details/` |
| Wrapper modal | `frontend-angular/src/app/shared/components/app-dialog/` |
| Formatage ingrédients / temps | `frontend-angular/src/app/core/utils/recipe-format.util.ts` |
| Conventions repo | `docs/conventions.md` |

---

## Résumé une phrase

**Le backend génère un PDF binaire avec pdfmake à partir de l'entité `Recipe` ; le frontend le récupère en `Blob`, l'affiche dans une modal via `iframe` + `blob:` URL, et le propose au téléchargement — sans aucune lib PDF côté Angular.**
