import { BadRequestException } from '@nestjs/common';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDateParam(
  value: string | undefined,
  fieldName: string,
): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || !ISO_DATE_RE.test(trimmed)) {
    throw new BadRequestException(
      `${fieldName} doit être une date au format YYYY-MM-DD`,
    );
  }
  const parsed = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(
      `${fieldName} doit être une date au format YYYY-MM-DD`,
    );
  }
  return trimmed;
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const parsed = new Date(`${isoDate}T12:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}
