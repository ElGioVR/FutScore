export const LOCALE = "es-MX";

const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();

function getDateTimeFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let formatter = dateTimeFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE, options);
    dateTimeFormatCache.set(key, formatter);
  }
  return formatter;
}

export function parseLocalDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }

  const [datePart, timePart = "00:00"] = value.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function formatDateWithOptions(date: Date, options: Intl.DateTimeFormatOptions): string {
  return getDateTimeFormat(options).format(date);
}

export function formatGameDate(game: { local_date: string }, options: Intl.DateTimeFormatOptions): string {
  return formatDateWithOptions(parseLocalDate(game.local_date), options);
}

export const DATE_FORMATS = {
  full: {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions,
  timeOnly: {
    hour: "numeric",
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions,
  dateTime12h: {
    day: "2-digit",
    month: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  } as Intl.DateTimeFormatOptions,
  dateShort: {
    day: "2-digit",
    month: "2-digit",
  } as Intl.DateTimeFormatOptions,
  bracketDate: {
    month: "short",
    day: "numeric",
  } as Intl.DateTimeFormatOptions,
  matchDayLabel: {
    weekday: "short",
    day: "numeric",
    month: "short",
  } as Intl.DateTimeFormatOptions,
  metaTime: {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  } as Intl.DateTimeFormatOptions,
};

export function formatFullDate(game: { local_date: string }): string {
  return formatGameDate(game, DATE_FORMATS.full);
}

export function formatDate(game: { local_date: string }): string {
  return formatGameDate(game, DATE_FORMATS.full);
}

export function formatKickoffTime(game: { local_date: string }): string {
  return formatGameDate(game, DATE_FORMATS.timeOnly);
}

export function formatKickoffDateTime(game: { local_date: string }): string {
  const date = parseLocalDate(game.local_date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours24 = date.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "pm" : "am";
  return `${day}/${month} ${hours}:${minutes} ${ampm}`;
}

export function formatKickoffDateShort(game: { local_date: string }): string {
  return formatGameDate(game, DATE_FORMATS.dateShort);
}

export function formatBracketDate(game: { local_date: string }): string {
  return formatGameDate(game, DATE_FORMATS.bracketDate);
}

export function formatMatchDayLabel(game: { local_date: string }): string {
  if (isTodayGame(game)) return "Hoy";
  return formatGameDate(game, DATE_FORMATS.matchDayLabel);
}

export function formatMetaTime(date: Date): string {
  return formatDateWithOptions(date, DATE_FORMATS.metaTime);
}

export function isTodayGame(game: { local_date: string }): boolean {
  const gameDate = parseLocalDate(game.local_date);
  const now = new Date();
  return (
    gameDate.getFullYear() === now.getFullYear() &&
    gameDate.getMonth() === now.getMonth() &&
    gameDate.getDate() === now.getDate()
  );
}

export function isTodayOrFutureGame(game: { local_date: string }): boolean {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return parseLocalDate(game.local_date).getTime() >= todayStart;
}

export function getDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayKeyFromGame(game: { local_date: string }): string {
  return getDayKey(parseLocalDate(game.local_date));
}

export function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function sameDayGame(game: { local_date: string }, date: Date): boolean {
  return sameDay(parseLocalDate(game.local_date), date);
}

export function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDateLabel(value: Date | null): string {
  if (!value) return "Mundial 2026";
  return formatDateWithOptions(value, DATE_FORMATS.matchDayLabel);
}

export function formatIcsDate(value: Date): string {
  return value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function escapeIcs(value: unknown): string {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}