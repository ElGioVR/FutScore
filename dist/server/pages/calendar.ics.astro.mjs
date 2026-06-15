import { f as fallbackPayload } from '../chunks/worldcup26_C0AivYp6.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
async function fetchPayload() {
  try {
    const response = await fetch("/api/worldcup.json");
    if (!response.ok) throw new Error("Failed to fetch payload");
    return await response.json();
  } catch {
    return fallbackPayload;
  }
}
function parseLocalDate(value) {
  const [datePart, timePart = "00:00"] = value.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}
function formatIcsDate(value) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function escapeIcs(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
function buildCalendarDescription(game) {
  return [
    `${game.home_team_name_en || game.home_team_label || "Home"} vs ${game.away_team_name_en || game.away_team_label || "Away"}`,
    game.matchday,
    game.broadcasts?.length ? `TV: ${game.broadcasts.join(", ")}` : "",
    game.links?.[0]?.href ? `ESPN: ${game.links[0].href}` : ""
  ].filter(Boolean).join("\\n");
}
function buildCalendarFile(payload) {
  const games = [...payload.games].sort(
    (a, b) => parseLocalDate(a.local_date).getTime() - parseLocalDate(b.local_date).getTime()
  );
  const events = games.map((game) => {
    const start = parseLocalDate(game.local_date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1e3);
    return [
      "BEGIN:VEVENT",
      `UID:futscore-${game.id}@futscore.local`,
      `DTSTAMP:${formatIcsDate(/* @__PURE__ */ new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcs(`${game.home_team_name_en ?? game.home_team_label ?? "Home"} vs ${game.away_team_name_en ?? game.away_team_label ?? "Away"}`)}`,
      `DESCRIPTION:${escapeIcs(buildCalendarDescription(game))}`,
      `LOCATION:${escapeIcs(game.stadium_id)}`,
      "END:VEVENT"
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
    "END:VCALENDAR"
  ].join("\r\n");
}
const get = async ({ request }) => {
  const payload = await fetchPayload();
  return new Response(buildCalendarFile(payload), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar;charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  get,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
