import { fallbackPayload, type ApiGame, type WorldCupPayload } from "@/lib/worldcup26";
import { icon } from "@/lib/icons";

type MatchStatus = "live" | "finished" | "upcoming";
type ActiveView = "all" | "live" | "today" | "date";
type DetailTab = "facts" | "events" | "tv";

const state: {
  payload: WorldCupPayload;
  activeView: ActiveView;
  activeGroup: string;
  selectedMatchId: string | null;
  query: string;
  activeDate: Date | null;
  activeDetailTab: DetailTab;
  mobileDetailOpen: boolean;
} = {
  payload: fallbackPayload,
  activeView: "all",
  activeGroup: "all",
  selectedMatchId: null,
  query: "",
  activeDate: null,
  activeDetailTab: "facts",
  mobileDetailOpen: false,
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
const matchesEl = $("#matches");
const groupsEl = $("#groups");
const detailEl = $("#match-detail");
const statusEl = $("#data-status");
const updatedEl = $("#updated-at");
const sourceEl = $("#data-source");
const groupFilterEl = $("#group-filter") as HTMLSelectElement;
const searchEl = $("#search") as HTMLInputElement;
const rootEl = document.querySelector(".score-layout") as HTMLElement;
const dateLabelEl = document.querySelector(".date-row strong") as HTMLElement;
const dateButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".date-row button"));

const stageLabels: Record<string, string> = {
  group: "Grupos",
  r32: "32avos",
  r16: "Octavos",
  qf: "Cuartos",
  sf: "Semifinal",
  third: "3er lugar",
  final: "Final",
};

async function fetchJson<T>(path: string, timeoutMs = 14000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, { signal: controller.signal });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return response.json() as Promise<T>;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function loadWorldCupData() {
  setDataStatus("Conectando con ESPN...", "loading");
  try {
    state.payload = await fetchJson<WorldCupPayload>("/api/worldcup.json", 26000);
    state.selectedMatchId = pickInitialMatchId();
    setDataStatus(
      state.payload.source === "espn"
        ? "Marcadores, eventos y TV en vivo"
        : state.payload.source === "worldcup26"
          ? "Datos alternos conectados"
          : "Usando datos demo",
      state.payload.source === "fallback" ? "fallback" : "ready",
    );
  } catch (error) {
    console.warn(error);
    state.payload = fallbackPayload;
    state.selectedMatchId = pickInitialMatchId();
    setDataStatus("Usando datos demo", "fallback");
  }
  render();
}

function setDataStatus(message: string, mode: "loading" | "ready" | "fallback") {
  statusEl.textContent = message;
  statusEl.dataset.mode = mode;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "#";
  } catch {
    return "#";
  }
}

function escapeIcs(value: unknown) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function getTeam(id: string) {
  return state.payload.teams.find((team) => team.id === id);
}

function getStadium(id: string) {
  return state.payload.stadiums.find((stadium) => stadium.id === id);
}

function getTeamName(game: ApiGame, side: "home" | "away") {
  const direct = side === "home" ? game.home_team_name_en : game.away_team_name_en;
  const label = side === "home" ? game.home_team_label : game.away_team_label;
  const team = getTeam(side === "home" ? game.home_team_id : game.away_team_id);
  return direct || team?.name_en || label || "Por definir";
}

function getTeamFlag(game: ApiGame, side: "home" | "away") {
  const direct = side === "home" ? game.home_team_flag : game.away_team_flag;
  const team = getTeam(side === "home" ? game.home_team_id : game.away_team_id);
  return direct || team?.flag || "";
}

function getStatus(game: ApiGame): MatchStatus {
  const elapsed = String(game.time_elapsed ?? "").toLowerCase();
  if (String(game.finished).toUpperCase() === "TRUE" || elapsed === "finished" || elapsed === "ft") return "finished";
  if (elapsed !== "notstarted" && elapsed !== "" && elapsed !== "null") return "live";
  return "upcoming";
}

function parseLocalDate(value: string) {
  const [datePart, timePart = "00:00"] = value.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatIcsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function formatDate(game: ApiGame) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(parseLocalDate(game.local_date));
}

function formatKickoffTime(game: ApiGame) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parseLocalDate(game.local_date));
}

function formatKickoffDateTime(game: ApiGame) {
  const date = parseLocalDate(game.local_date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours24 = date.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "pm" : "am";
  return `${day}/${month} ${hours}:${minutes} ${ampm}`;
}

function formatKickoffDateShort(game: ApiGame) {
  const date = parseLocalDate(game.local_date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function isToday(game: ApiGame) {
  const gameDate = parseLocalDate(game.local_date);
  const now = new Date();
  return gameDate.getFullYear() === now.getFullYear() && gameDate.getMonth() === now.getMonth() && gameDate.getDate() === now.getDate();
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateLabel(value: Date | null) {
  if (!value) return "Mundial 2026";
  return new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" }).format(value);
}

function normalizeScorers(value?: string) {
  if (!value || value === "null") return [];
  return value
    .replace(/[{}"]/g, "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function filteredGames() {
  return [...state.payload.games]
    .sort((a, b) => parseLocalDate(a.local_date).getTime() - parseLocalDate(b.local_date).getTime())
    .filter((game) => {
      const status = getStatus(game);
      const text = `${getTeamName(game, "home")} ${getTeamName(game, "away")} ${game.group} ${game.matchday} ${game.headline?.text ?? ""}`.toLowerCase();
      if (state.activeView === "live" && status !== "live") return false;
      if (state.activeView === "today" && !isToday(game)) return false;
      if (state.activeView === "date" && state.activeDate && !sameDay(parseLocalDate(game.local_date), state.activeDate)) return false;
      if (state.activeGroup !== "all" && game.group !== state.activeGroup) return false;
      if (state.query && !text.includes(state.query.toLowerCase())) return false;
      return true;
    });
}

function pickInitialMatchId() {
  const live = state.payload.games.find((game) => getStatus(game) === "live");
  const upcoming = [...state.payload.games]
    .filter((game) => getStatus(game) === "upcoming")
    .sort((a, b) => parseLocalDate(a.local_date).getTime() - parseLocalDate(b.local_date).getTime())[0];
  return live?.id ?? upcoming?.id ?? state.payload.games[0]?.id ?? null;
}

function statusBadge(game: ApiGame) {
  const status = getStatus(game);
  const label = status === "live"
    ? String(game.time_elapsed)
    : status === "finished"
      ? "FT"
      : formatKickoffTime(game);
  const className = status === "live" ? "status-live" : status === "finished" ? "status-finished" : "status-upcoming";
  return `<span class="${className} minute-pill">${escapeHtml(label)}</span>`;
}



function formatAttendance(value?: number) {
  if (!value) return "No disponible";
  return new Intl.NumberFormat("es-MX").format(value);
}

function renderStats(game: ApiGame) {
  const homeStats = game.stats?.home ?? [];
  const awayStats = game.stats?.away ?? [];
  const statNames = [...new Set([...homeStats, ...awayStats].map((stat) => stat.name))];
  if (!statNames.length) return `<p class="empty-copy">ESPN no publico estadisticas para este partido.</p>`;

  return statNames
    .map((name) => {
      const home = homeStats.find((stat) => stat.name === name);
      const away = awayStats.find((stat) => stat.name === name);
      return `
        <div class="stat-row">
          <strong>${escapeHtml(home?.value ?? "-")}</strong>
          <span>${escapeHtml(home?.label ?? away?.label ?? name)}</span>
          <strong>${escapeHtml(away?.value ?? "-")}</strong>
        </div>
      `;
    })
    .join("");
}

function renderTvPanel(broadcasts: string[], links: NonNullable<ApiGame["links"]>) {
  return `
    <div class="tv-panel">
      <div class="tv-card">
        <span>Transmision</span>
        <strong>${escapeHtml(broadcasts.length ? broadcasts.join(", ") : "Sin transmision en el feed")}</strong>
      </div>
      <div class="tv-card">
        <span>ESPN</span>
        ${links.length ? `
          <div class="espn-links compact">
            ${links.map((link) => `<a href="${safeUrl(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.text)}</a>`).join("")}
          </div>
        ` : `<strong>Sin links disponibles</strong>`}
      </div>
    </div>
  `;
}

function buildCalendarDescription(game: ApiGame) {
  const stadium = getStadium(game.stadium_id);
  const parts = [
    `${getTeamName(game, "home")} vs ${getTeamName(game, "away")}`,
    game.matchday,
    stadium?.name_en ? `Venue: ${stadium.name_en}` : "",
    game.broadcasts?.length ? `TV: ${game.broadcasts.join(", ")}` : "",
    game.links?.[0]?.href ? `ESPN: ${game.links[0].href}` : "",
  ].filter(Boolean);
  return parts.join("\\n");
}

function buildCalendarFile() {
  const now = formatIcsDate(new Date());
  const games = [...state.payload.games].sort((a, b) => parseLocalDate(a.local_date).getTime() - parseLocalDate(b.local_date).getTime());
  const events = games.map((game) => {
    const start = parseLocalDate(game.local_date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const stadium = getStadium(game.stadium_id);
    const title = `${getTeamName(game, "home")} vs ${getTeamName(game, "away")}`;
    return [
      "BEGIN:VEVENT",
      `UID:futscore-${game.id}@futscore.local`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(buildCalendarDescription(game))}`,
      `LOCATION:${escapeIcs(stadium?.name_en ?? stadium?.fifa_name ?? "Por confirmar")}`,
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


function isMobileViewport() {
  return window.innerWidth <= 1279;
}

function renderMatches() {
  const games = filteredGames();
  if (!games.length) {
    matchesEl.innerHTML = `<div class="panel p-8 text-center text-sm text-zinc-400">No hay partidos para este filtro.</div>`;
    return;
  }

  const grouped = games.reduce<Record<string, ApiGame[]>>((acc, game) => {
    const label = game.type === "group" ? `Group ${game.group}` : stageLabels[game.type] ?? game.type;
    acc[label] = acc[label] ?? [];
    acc[label].push(game);
    return acc;
  }, {});

  matchesEl.innerHTML = Object.entries(grouped)
    .map(([groupName, groupGames]) => `
      <section class="league-card">
        <div class="league-card-header">
          <span><span aria-hidden="true">WC</span> FIFA World Cup</span>
          <span>${groupGames.length} partidos</span>
        </div>
        <span class="group-label">${escapeHtml(groupName)}</span>
        ${groupGames.map((game) => {
          const selected = game.id === state.selectedMatchId;
          const homeFlag = getTeamFlag(game, "home");
          const awayFlag = getTeamFlag(game, "away");
          const status = getStatus(game);
          let scoreCellHtml = "";
          if (status === "upcoming") {
            const dateLabel = isToday(game) ? "Hoy" : formatKickoffDateShort(game);
            scoreCellHtml = `<div class="score-cell"><small class="match-date">${escapeHtml(dateLabel)}</small><div class="match-vs">vs</div></div>`;
          } else {
            const scoreText = `${Number(game.home_score) || 0} - ${Number(game.away_score) || 0}`;
            scoreCellHtml = `<span class="score-cell">${escapeHtml(scoreText)}</span>`;
          }
          return `
            <button class="match-card match-row ${selected ? "selected" : ""}" data-match-id="${game.id}">
              <span class="time-cell">${statusBadge(game)}</span>
              <span class="team-cell">
                <span>${escapeHtml(getTeamName(game, "home"))}</span>
                ${homeFlag ? `<img src="${safeUrl(homeFlag)}" alt="">` : ""}
              </span>
              ${scoreCellHtml}
              <span class="team-cell away">
                ${awayFlag ? `<img src="${safeUrl(awayFlag)}" alt="">` : ""}
                <span>${escapeHtml(getTeamName(game, "away"))}</span>
              </span>
              <span class="row-icons" aria-hidden="true">${game.broadcasts?.length ? icon("tv", "inline-icon", 16) : ""}</span>
            </button>
          `;
        }).join("")}
      </section>
    `)
    .join("");

  document.querySelectorAll<HTMLButtonElement>(".match-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMatchId = button.dataset.matchId ?? state.selectedMatchId;
      state.activeDetailTab = "facts";
      if (isMobileViewport()) {
        state.mobileDetailOpen = true;
      }
      render();
    });
  });
}

function renderGroups() {
  const groups = [...new Set(state.payload.teams.map((team) => team.groups).filter((group): group is string => Boolean(group)))].sort();
  groupFilterEl.innerHTML = `<option value="all">Todos los grupos</option>${groups.map((group) => `<option value="${escapeHtml(group)}">Group ${escapeHtml(group)}</option>`).join("")}`;
  groupFilterEl.value = state.activeGroup;

  const standings = state.payload.groups.length
    ? state.payload.groups
    : groups.map((group) => ({
      group,
      teams: state.payload.teams
        .filter((team) => team.groups === group)
        .map((team) => ({ team_id: team.id, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 })),
    }));

  groupsEl.innerHTML = standings
    .filter((group) => state.activeGroup === "all" || group.group === state.activeGroup)
    .sort((a, b) => String(a.group).localeCompare(String(b.group)))
    .map((group) => {
      const rows = [...(group.teams ?? [])].sort((a, b) => Number(b.pts) - Number(a.pts) || Number(b.gd) - Number(a.gd));
      return `
        <section class="standings-card">
          <div class="standings-card-head">
            <h3>Group ${escapeHtml(group.group)}</h3>
            <span>${rows.length} teams</span>
          </div>
          <div class="standings-table">
            <div class="standings-row standings-row-head">
              <span>#</span>
              <span></span>
              <span>PL</span>
              <span>GD</span>
              <span>PTS</span>
            </div>
            ${rows.map((row, index) => {
              const team = getTeam(row.team_id);
              const gd = Number(row.gd);
              const gdText = gd > 0 ? `+${gd}` : String(gd);
              return `
                <div class="standings-row">
                  <span class="rank-cell" data-rank="${index + 1}">${index + 1}</span>
                  <span class="team-name">
                    ${team?.flag ? `<img src="${safeUrl(team.flag)}" alt="">` : ""}
                    <span>${escapeHtml(team?.name_en ?? row.team_id)}</span>
                  </span>
                  <span>${row.mp}</span>
                  <span>${gdText}</span>
                  <strong>${row.pts}</strong>
                </div>
              `;
            }).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderDetail() {
  const game = state.payload.games.find((item) => item.id === state.selectedMatchId) ?? state.payload.games[0];
  if (!game) {
    detailEl.innerHTML = `<p class="p-4 text-sm text-zinc-500">Selecciona un partido.</p>`;
    return;
  }

  const stadium = getStadium(game.stadium_id);
  const homeFlag = getTeamFlag(game, "home");
  const awayFlag = getTeamFlag(game, "away");
  const status = getStatus(game);
  const homeScorers = normalizeScorers(game.home_scorers);
  const awayScorers = normalizeScorers(game.away_scorers);
  const broadcasts = game.broadcasts ?? [];
  const links = game.links ?? [];
  const events = game.events ?? [];
  const statusText = status === "finished" ? "Full time" : status === "live" ? String(game.time_elapsed) : formatKickoffTime(game);
  const headlineText = game.headline?.text || game.headline?.description;
  const factsPanel = `
    ${headlineText ? `
      <div class="headline-box">
        <span>${escapeHtml(game.headline?.type ?? "ESPN")}</span>
        <strong>${escapeHtml(headlineText)}</strong>
      </div>
    ` : ""}

    <div class="selected-facts">
      <div>
        <span>Stage</span>
        <strong>${escapeHtml(stageLabels[game.type] ?? game.type)}</strong>
      </div>
      <div>
        <span>Goals</span>
        <strong>${escapeHtml(homeScorers.length + awayScorers.length ? [...homeScorers, ...awayScorers].join(", ") : "Sin goles")}</strong>
      </div>
      <div>
        <span>TV</span>
        <strong>${escapeHtml(broadcasts.length ? broadcasts.join(", ") : "Sin transmision en el feed")}</strong>
      </div>
      <div>
        <span>Asistencia</span>
        <strong>${escapeHtml(formatAttendance(game.attendance))}</strong>
      </div>
    </div>

    <div class="stat-list">
      <h3>Estadisticas ESPN</h3>
      ${renderStats(game)}
    </div>
  `;
  const eventsPanel = `
    <div class="event-list">
      <h3>Eventos ESPN</h3>
      ${events.length ? events.map((event) => `
        <div class="event-row" data-kind="${event.kind}">
          <span>${escapeHtml(event.minute || "--")}</span>
          <strong>${escapeHtml(event.type)}</strong>
          <p>${escapeHtml(event.player)}</p>
        </div>
      `).join("") : `<p class="empty-copy">Sin eventos disponibles para este partido.</p>`}
    </div>
  `;
  const tvPanel = renderTvPanel(broadcasts, links);
  const activePanel = state.activeDetailTab === "events" ? eventsPanel : state.activeDetailTab === "tv" ? tvPanel : factsPanel;

  detailEl.innerHTML = `
    <article class="selected-match-card">
      <div class="selected-match-top">
        <button type="button" class="detail-close" aria-label="Volver al listado">
          ${icon("chevron-left", "text-white", 18)}
        </button>
        <div>
          <p>Partido seleccionado</p>
          <h2>${escapeHtml(game.matchday)}</h2>
        </div>
        ${links[0] ? `<a href="${safeUrl(links[0].href)}" target="_blank" rel="noreferrer">ESPN</a>` : ""}
      </div>

      <div class="selected-match-meta">
        <span>${escapeHtml(formatDate(game))}</span>
        <span>${escapeHtml(stadium?.fifa_name ?? stadium?.name_en ?? "Por confirmar")}</span>
      </div>

      <div class="selected-score-block">
        <div class="selected-team">
          ${homeFlag ? `<img src="${safeUrl(homeFlag)}" alt="">` : ""}
          <strong>${escapeHtml(getTeamName(game, "home"))}</strong>
          <span>${escapeHtml(game.group ? `Group ${game.group}` : "Home")}</span>
        </div>

        <div class="selected-score">
          <strong>${Number(game.home_score) || 0} - ${Number(game.away_score) || 0}</strong>
          <span>${escapeHtml(game.status_detail ?? statusText)}</span>
        </div>

        <div class="selected-team">
          ${awayFlag ? `<img src="${safeUrl(awayFlag)}" alt="">` : ""}
          <strong>${escapeHtml(getTeamName(game, "away"))}</strong>
          <span>${escapeHtml(game.group ? `Group ${game.group}` : "Away")}</span>
        </div>
      </div>

      <div class="selected-tabs" role="tablist" aria-label="Detalle del partido">
        <button type="button" data-detail-tab="facts" data-active="${state.activeDetailTab === "facts"}" role="tab" aria-selected="${state.activeDetailTab === "facts"}">Facts</button>
        <button type="button" data-detail-tab="events" data-active="${state.activeDetailTab === "events"}" role="tab" aria-selected="${state.activeDetailTab === "events"}">Events</button>
        <button type="button" data-detail-tab="tv" data-active="${state.activeDetailTab === "tv"}" role="tab" aria-selected="${state.activeDetailTab === "tv"}">TV</button>
      </div>

      <div class="detail-tab-panel" role="tabpanel">
        ${activePanel}
      </div>
    </article>
  `;

  document.querySelectorAll<HTMLButtonElement>("[data-detail-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeDetailTab = (button.dataset.detailTab as DetailTab) ?? "facts";
      renderDetail();
    });
  });

  const closeButton = detailEl.querySelector<HTMLButtonElement>(".detail-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      state.mobileDetailOpen = false;
      render();
    });
  }

  if (rootEl) {
    rootEl.dataset.mobileDetailOpen = String(isMobileViewport() && state.mobileDetailOpen);
  }
}

function renderMeta() {
  updatedEl.textContent = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(state.payload.updatedAt));
  const sourceLabel: Record<WorldCupPayload["source"], string> = {
    espn: "ESPN publico",
    worldcup26: "worldcup26.ir",
    fallback: "demo local",
  };
  sourceEl.textContent = sourceLabel[state.payload.source];
}

function renderDateControls() {
  dateLabelEl.textContent = formatDateLabel(state.activeDate);
}

function render() {
  renderMeta();
  renderDateControls();
  renderMatches();
  renderGroups();
  renderDetail();
}

document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeView = (button.dataset.view as ActiveView) ?? "all";
    state.activeDate = state.activeView === "today" ? new Date() : null;
    document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((item) => {
      item.dataset.active = String(item === button);
    });
    render();
  });
});

dateButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const direction = index === 0 ? -1 : 1;
    state.activeDate = addDays(state.activeDate ?? new Date(), direction);
    state.activeView = "date";
    document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((item) => {
      item.dataset.active = "false";
    });
    render();
  });
});

groupFilterEl.addEventListener("change", () => {
  state.activeGroup = groupFilterEl.value;
  render();
});

searchEl.addEventListener("input", () => {
  state.query = searchEl.value.trim();
  render();
});

$("#refresh").addEventListener("click", loadWorldCupData);

let lastViewportWidth = window.innerWidth;
window.addEventListener("resize", () => {
  const currentWidth = window.innerWidth;
  const wasMobile = lastViewportWidth <= 1279;
  const isNowDesktop = currentWidth > 1279;
  
  if (wasMobile && isNowDesktop) {
    state.mobileDetailOpen = false;
    render();
  }
  
  lastViewportWidth = currentWidth;
});

state.selectedMatchId = pickInitialMatchId();
render();
loadWorldCupData();
