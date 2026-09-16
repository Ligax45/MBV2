import { BadRequestException } from '@nestjs/common';

const MIN_HALF_UNITS = 1;
const MAX_HALF_UNITS = 10;

export function parseRatingInput(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new BadRequestException('La note doit être un nombre');
  }

  const halfUnits = Math.round(numeric * 2);
  if (halfUnits < MIN_HALF_UNITS || halfUnits > MAX_HALF_UNITS) {
    throw new BadRequestException('La note doit être comprise entre 0,5 et 5');
  }

  if (Math.abs(numeric * 2 - halfUnits) > 0.001) {
    throw new BadRequestException('La note doit être un multiple de 0,5');
  }

  return halfUnits;
}

export function halfUnitsToRating(halfUnits: number): number {
  return halfUnits / 2;
}

export function averageHalfUnitsToRating(
  averageHalfUnits: number | null | undefined,
): number | null {
  if (averageHalfUnits == null || !Number.isFinite(averageHalfUnits)) {
    return null;
  }
  return Math.round(averageHalfUnits) / 2;
}
