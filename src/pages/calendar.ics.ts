import { type APIRoute } from "astro";
import { type WorldCupPayload, fallbackPayload } from "@/lib/worldcup26";

export const prerender = false;

async function fetchPayload(): Promise<WorldCupPayload> {
  try {
    const response = await fetch("/api/worldcup.json");
    if (!response.ok) throw new Error("Failed to fetch payload");
    return (await response.json()) as WorldCupPayload;
  } catch {
    return fallbackPayload;
  }
}

function parseLocalDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }

  const [datePart, timePart = "00:00"] = value.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatIcsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: unknown) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildCalendarDescription(game: WorldCupPayload["games"][number]) {
  return [
    `${game.home_team_name_en || game.home_team_label || "Home"} vs ${game.away_team_name_en || game.away_team_label || "Away"}`,
    game.matchday,
    game.broadcasts?.length ? `TV: ${game.broadcasts.join(", ")}` : "",
    game.links?.[0]?.href ? `ESPN: ${game.links[0].href}` : "",
  ]
    .filter(Boolean)
    .join("\\n");
}

function buildCalendarFile(payload: WorldCupPayload) {
  const games = [...payload.games].sort(
    (a, b) => parseLocalDate(a.local_date).getTime() - parseLocalDate(b.local_date).getTime(),
  );

  const events = games.map((game) => {
    const start = parseLocalDate(game.local_date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `UID:futscore-${game.id}@futscore.local`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcs(`${game.home_team_name_en ?? game.home_team_label ?? "Home"} vs ${game.away_team_name_en ?? game.away_team_label ?? "Away"}`)}`,
      `DESCRIPTION:${escapeIcs(buildCalendarDescription(game))}`,
      `LOCATION:${escapeIcs(game.stadium_id)}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FutScore//World Cup 2026//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:FIFA World Cup 2026",
    "X-WR-TIMEZONE:UTC",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export const get: APIRoute = async ({ request }) => {
  const payload = await fetchPayload();
  return new Response(buildCalendarFile(payload), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar;charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
};
