import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

const STAR_COUNT = 5;

@Component({
  selector: 'app-recipe-star-rating',
  imports: [DecimalPipe],
  templateUrl: './recipe-star-rating.component.html',
  styleUrl: './recipe-star-rating.component.scss',
})
export class RecipeStarRatingComponent {
  readonly rating = input<number | null>(null);
  readonly interactive = input(false);
  readonly disabled = input(false);
  readonly ariaLabel = input('Note sur 5');

  readonly ratingChange = output<number>();

  protected readonly starIndexes = Array.from({ length: STAR_COUNT }, (_, i) => i + 1);

  protected displayRating(): number {
    const value = this.rating();
    if (value == null) {
      return 0;
    }
    return Math.min(STAR_COUNT, Math.max(0, value));
  }

  protected starIcon(starIndex: number): string {
    const value = this.displayRating();
    if (value >= starIndex) {
      return 'pi pi-star-fill';
    }
    if (value >= starIndex - 0.5) {
      return 'pi pi-star-half-fill';
    }
    return 'pi pi-star';
  }

  protected onStarClick(event: MouseEvent, starIndex: number): void {
    if (!this.interactive() || this.disabled()) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    const next = isLeftHalf ? starIndex - 0.5 : starIndex;
    this.ratingChange.emit(next);
  }

  protected onStarKeydown(event: KeyboardEvent, starIndex: number): void {
    if (!this.interactive() || this.disabled()) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.ratingChange.emit(starIndex);
    }
  }
}
