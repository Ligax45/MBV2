const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const weekdayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});
const weekRangeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function isIsoDateString(value: string): boolean {
  return ISO_DATE_RE.test(value);
}

export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Lundi de la semaine contenant `date` (calendrier local). */
export function startOfWeekMonday(date: Date): string {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return toIsoDateString(copy);
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  parsed.setDate(parsed.getDate() + days);
  return toIsoDateString(parsed);
}

export function buildWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    addDaysToIsoDate(weekStart, index),
  );
}

export function formatWeekdayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const label = weekdayFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return shortDateFormatter.format(date);
}

export function formatWeekRangeLabel(weekStart: string, weekEnd: string): string {
  const startParts = weekStart.split('-').map(Number);
  const endParts = weekEnd.split('-').map(Number);
  const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
  const endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);
  return `${weekRangeFormatter.format(startDate)} – ${weekRangeFormatter.format(endDate)}`;
}
