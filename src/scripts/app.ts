import {
  fallbackPayload,
  type ApiGame,
  type ApiGroupStanding,
  type WorldCupPayload,
} from "@/lib/worldcup26";
import { icon } from "@/lib/icons";
import {
  parseLocalDate,
  formatDate,
  formatKickoffTime,
  formatKickoffDateTime,
  formatKickoffDateShort,
  formatBracketDate,
  formatMatchDayLabel,
  isTodayGame as isToday,
  isTodayOrFutureGame as isTodayOrFuture,
  getDayKey,
  sameDay,
  addDays,
  formatDateLabel,
  formatMetaTime,
} from "@/lib/date";
import { fetchJson } from "@/lib/fetch";

type MatchStatus = "live" | "finished" | "upcoming";
type ActiveView = "all" | "live" | "today" | "date";
type ActiveSection = "matches" | "bracket" | "groups" | "detail";
type DetailTab = "facts" | "events" | "tv";

const state: {
  payload: WorldCupPayload;
  activeView: ActiveView;
  activeGroup: string;
  visibleDayCount: number;
  selectedMatchId: string | null;
  query: string;
  activeDate: Date | null;
  activeDetailTab: DetailTab;
  activeSection: ActiveSection;
  mobileDetailOpen: boolean;
  selectedByUser: boolean;
} = {
  payload: fallbackPayload,
  activeView: "all",
  activeGroup: "all",
  visibleDayCount: 3,
  selectedMatchId: null,
  query: "",
  activeDate: new Date(),
  activeDetailTab: "facts",
  activeSection: "matches",
  mobileDetailOpen: false,
  selectedByUser: false,
};

const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector(selector) as T;
const matchesEl = $("#matches");
const bracketShellEl = $("#bracket");
const knockoutEl = $("#knockout-bracket");
const groupGridEls = Array.from(
  document.querySelectorAll<HTMLElement>("[data-groups-grid]"),
);
const feedGroupsEl = $("#feed-groups");
const detailMobileEl = $("#detail-mobile") as HTMLElement | null;
const detailEl = $("#match-detail");
const statusEl = $("#data-status");
const updatedEl = $("#updated-at");
const sourceEl = $("#data-source");
const groupFilterEl = $("#group-filter") as HTMLSelectElement;
const searchEl = $("#search") as HTMLInputElement;
const rootEl = document.querySelector(".score-layout") as HTMLElement;
const dateCardEl = document.querySelector(".date-card") as HTMLElement;
const filterToggleEl = $("#filter-toggle") as HTMLButtonElement;
const dateLabelEl = document.querySelector(".date-row strong") as HTMLElement;
const dateButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".date-row button"),
);
const sectionLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("[data-section-link]"),
);
const mobileMenuToggleEl = $("#mobile-menu-toggle") as HTMLButtonElement;
const mobileMenuEl = $("#mobile-menu") as HTMLElement;
const ligaMxBannerEl = document.querySelector(
  "#ligamx-banner",
) as HTMLElement | null;
const ligaMxBannerToggleEl = document.querySelector(
  "#ligamx-banner-toggle",
) as HTMLButtonElement | null;

const stageLabels: Record<string, string> = {
  group: "Grupos",
  r32: "32avos",
  r16: "Octavos",
  qf: "Cuartos",
  sf: "Semifinal",
  third: "3er lugar",
  final: "Final",
};

let pollTimer: ReturnType<typeof setTimeout> | null = null;
let isManualRefresh = false;
const POLL_INTERVAL = 20000;
let liveTimerInterval: ReturnType<typeof setInterval> | null = null;

function scheduleNextPoll() {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(loadWorldCupData, POLL_INTERVAL);
}

function cancelPoll() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function startLiveTimer() {
  if (liveTimerInterval) return;
  liveTimerInterval = setInterval(() => {
    const liveGames = state.payload.games.filter((g) => getStatus(g) === "live");
    if (!liveGames.length) {
      clearInterval(liveTimerInterval!);
      liveTimerInterval = null;
      return;
    }
    updateLiveTimers();
  }, 60000);
}

function updateLiveTimers() {
  document.querySelectorAll<HTMLSpanElement>(".minute-pill.status-live").forEach((el) => {
    const btn = el.closest<HTMLButtonElement>(".match-card, .bracket-game");
    const matchId = btn?.dataset.matchId;
    if (!matchId) return;
    const game = state.payload.games.find((g) => g.id === matchId);
    if (game && getStatus(game) === "live") {
      el.textContent = escapeHtml(String(game.time_elapsed));
    }
  });

  const detailTimerEl = document.querySelector<HTMLSpanElement>(".selected-live-time");
  if (detailTimerEl) {
    const selectedGame = state.payload.games.find((g) => g.id === state.selectedMatchId);
    if (selectedGame && getStatus(selectedGame) === "live") {
      detailTimerEl.textContent = escapeHtml(String(selectedGame.time_elapsed));
    }
  }
}

async function loadWorldCupData() {
  cancelPoll();
  setDataStatus("Conectando con ESPN...", "loading");
  try {
    state.payload = await fetchJson<WorldCupPayload>("/api/worldcup.json", {
      timeoutMs: 26000,
      retries: 2,
      retryDelay: (attempt) => attempt * 1000,
    });
    clearStatusCache();
    if (isManualRefresh || !state.selectedByUser) {
      state.selectedMatchId = pickInitialMatchId();
      state.selectedByUser = false;
    }
    isManualRefresh = false;
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
    clearStatusCache();
    if (isManualRefresh || !state.selectedByUser) {
      state.selectedMatchId = pickInitialMatchId();
      state.selectedByUser = false;
    }
    isManualRefresh = false;
    setDataStatus("Usando datos demo", "fallback");
  }
  render();
  startLiveTimer();
  scheduleNextPoll();
}

function setDataStatus(
  message: string,
  mode: "loading" | "ready" | "fallback",
) {
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
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : "#";
  } catch {
    return "#";
  }
}

function getTeam(id: string) {
  return state.payload.teams.find((team) => team.id === id);
}

function getStadium(id: string) {
  return state.payload.stadiums.find((stadium) => stadium.id === id);
}

function getTeamName(game: ApiGame, side: "home" | "away") {
  const direct =
    side === "home" ? game.home_team_name_en : game.away_team_name_en;
  const label = side === "home" ? game.home_team_label : game.away_team_label;
  const team = getTeam(side === "home" ? game.home_team_id : game.away_team_id);
  return direct || team?.name_en || label || "Por definir";
}

function getTeamFlag(game: ApiGame, side: "home" | "away") {
  const direct = side === "home" ? game.home_team_flag : game.away_team_flag;
  const team = getTeam(side === "home" ? game.home_team_id : game.away_team_id);
  return direct || team?.flag || "";
}

const statusCache = new Map<string, MatchStatus>();

function getStatus(game: ApiGame): MatchStatus {
  const cached = statusCache.get(game.id);
  if (cached) return cached;

  const elapsed = String(game.time_elapsed ?? "").toLowerCase();
  let result: MatchStatus;
  if (
    String(game.finished).toUpperCase() === "TRUE" ||
    elapsed === "finished" ||
    elapsed === "ft"
  )
    result = "finished";
  else if (elapsed !== "notstarted" && elapsed !== "" && elapsed !== "null")
    result = "live";
  else
    result = "upcoming";

  statusCache.set(game.id, result);
  return result;
}

function clearStatusCache() {
  statusCache.clear();
}

function normalizeScorers(value?: string) {
  if (!value || value === "null") return [];
  return value
    .replace(/[{}"]/g, "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeAccents(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function gameSearchText(game: ApiGame) {
  return removeAccents(
    `${getTeamName(game, "home")} ${getTeamName(game, "away")} ${game.group} ${game.matchday} ${game.headline?.text ?? ""}`.toLowerCase(),
  );
}

function matchesBaseFilters(game: ApiGame) {
  if (state.activeGroup !== "all" && game.group !== state.activeGroup)
    return false;
  if (
    state.query &&
    !gameSearchText(game).includes(removeAccents(state.query.toLowerCase()))
  )
    return false;
  return true;
}

function filteredGames() {
  const games = [...state.payload.games]
    .sort(sortGamesForCurrentView)
    .filter((game) => {
      const status = getStatus(game);
      if (state.activeView === "live" && status !== "live") return false;
      if (state.activeView === "today" && !isToday(game)) return false;
      if (state.activeView === "all" && !isTodayOrFuture(game)) return false;
      if (
        state.activeView === "date" &&
        state.activeDate &&
        !sameDay(parseLocalDate(game.local_date), state.activeDate)
      )
        return false;
      return matchesBaseFilters(game);
    });

  if (state.activeView !== "all") return games;

  const visibleDays = getVisibleDayKeys(games);
  return games.filter((game) =>
    visibleDays.has(getDayKey(parseLocalDate(game.local_date))),
  );
}

function sortGamesForCurrentView(a: ApiGame, b: ApiGame) {
  if (state.activeView !== "today" && state.activeView !== "all") {
    return (
      parseLocalDate(a.local_date).getTime() -
      parseLocalDate(b.local_date).getTime()
    );
  }

  const now = new Date().getTime();
  const aTime = parseLocalDate(a.local_date).getTime();
  const bTime = parseLocalDate(b.local_date).getTime();
  const rank = (game: ApiGame, kickoff: number) => {
    const status = getStatus(game);
    if (status === "live") return 0;
    if (status === "upcoming" && kickoff >= now) return 1;
    if (isToday(game)) return 2;
    return 3;
  };

  return rank(a, aTime) - rank(b, bTime) || aTime - bTime;
}

function getAllViewGames() {
  return [...state.payload.games]
    .sort(sortGamesForCurrentView)
    .filter((game) => isTodayOrFuture(game) && matchesBaseFilters(game));
}

function getVisibleDayKeys(games: ApiGame[]) {
  return new Set(
    [
      ...new Set(
        games.map((game) => getDayKey(parseLocalDate(game.local_date))),
      ),
    ].slice(0, state.visibleDayCount),
  );
}

function hasMoreAllViewDays() {
  if (state.activeView !== "all") return false;
  const days = new Set(
    getAllViewGames().map((game) => getDayKey(parseLocalDate(game.local_date))),
  );
  return days.size > state.visibleDayCount;
}

function groupMatchesQuery(group: string, query: string) {
  const normalizedQuery = removeAccents(query.toLowerCase());
  return state.payload.teams.some((team) => {
    if (team.groups !== group) return false;
    return removeAccents(
      `${team.name_en} ${team.fifa_code ?? ""}`.toLowerCase(),
    ).includes(normalizedQuery);
  });
}

function visibleGroupsForCurrentContext() {
  if (state.activeGroup !== "all") return new Set([state.activeGroup]);

  const hasActiveFilters = Boolean(state.query);
  if (hasActiveFilters) {
    const visibleGroups = new Set<string>();
    if (state.query) {
      state.payload.teams.forEach((team) => {
        if (team.groups && groupMatchesQuery(team.groups, state.query))
          visibleGroups.add(team.groups);
      });
    }
    return visibleGroups;
  }

  if (state.selectedByUser) {
    const selectedGame = state.payload.games.find(
      (game) => game.id === state.selectedMatchId,
    );
    if (selectedGame?.group) return new Set([selectedGame.group]);
  }

  return null;
}

function pickInitialMatchId() {
  const todayGames = [...state.payload.games]
    .filter((game) => isToday(game))
    .sort(sortGamesForCurrentView);
  const live = todayGames.find((game) => getStatus(game) === "live");
  const upcomingToday = todayGames.find(
    (game) => getStatus(game) === "upcoming",
  );
  const upcoming = [...state.payload.games]
    .filter((game) => getStatus(game) === "upcoming")
    .sort(
      (a, b) =>
        parseLocalDate(a.local_date).getTime() -
        parseLocalDate(b.local_date).getTime(),
    )[0];
  return (
    live?.id ??
    upcomingToday?.id ??
    todayGames[0]?.id ??
    upcoming?.id ??
    state.payload.games[0]?.id ??
    null
  );
}

function statusBadge(game: ApiGame) {
  const status = getStatus(game);
  const label =
    status === "live"
      ? String(game.time_elapsed)
      : status === "finished"
        ? "FT"
        : formatKickoffTime(game);
  const className =
    status === "live"
      ? "status-live"
      : status === "finished"
        ? "status-finished"
        : "status-upcoming";
  return `<span class="${className} minute-pill">${escapeHtml(label)}</span>`;
}

function formatAttendance(value?: number) {
  if (!value) return "No disponible";
  return new Intl.NumberFormat("es-MX").format(value);
}

function renderStats(game: ApiGame) {
  const homeStats = game.stats?.home ?? [];
  const awayStats = game.stats?.away ?? [];
  const statNames = [
    ...new Set([...homeStats, ...awayStats].map((stat) => stat.name)),
  ];
  if (!statNames.length)
    return `<p class="empty-copy">ESPN no publico estadisticas para este partido.</p>`;

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

function renderTvPanel(
  broadcasts: string[],
  links: NonNullable<ApiGame["links"]>,
) {
  return `
    <div class="tv-panel">
      <div class="tv-card">
        <span>Transmision</span>
        <strong>${escapeHtml(broadcasts.length ? broadcasts.join(", ") : "Sin transmision en el feed")}</strong>
      </div>
      <div class="tv-card">
        <span>ESPN</span>
        ${
          links.length
            ? `
          <div class="espn-links compact">
            ${links.map((link) => `<a href="${safeUrl(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.text)}</a>`).join("")}
          </div>
        `
            : `<strong>Sin links disponibles</strong>`
        }
      </div>
    </div>
  `;
}

function isMobileViewport() {
  return window.innerWidth <= 1279;
}

function isTableViewport() {
  return window.innerWidth >= 1024 && window.innerWidth <= 1279;
}

function renderMatches() {
  const games = filteredGames();
  if (!games.length) {
    matchesEl.innerHTML = `<div class="panel p-8 text-center text-sm text-zinc-400">No hay partidos para este filtro.</div>`;
    return;
  }

  const grouped = games.reduce<Record<string, ApiGame[]>>((acc, game) => {
    const label =
      state.activeView === "today" || state.activeView === "all"
        ? formatMatchDayLabel(game)
        : game.type === "group"
          ? `Grupo ${game.group}`
          : (stageLabels[game.type] ?? game.type);
    acc[label] = acc[label] ?? [];
    acc[label].push(game);
    return acc;
  }, {});

  matchesEl.innerHTML =
    Object.entries(grouped)
      .map(
        ([groupName, groupGames]) => `
      <section class="league-card">
        <div class="league-card-header">
          <span><span aria-hidden="true">CM</span> Copa Mundial FIFA</span>
          <span>${groupGames.length} partidos</span>
        </div>
        <span class="group-label">${escapeHtml(groupName)}</span>
        ${groupGames
          .map((game) => {
            const selected = game.id === state.selectedMatchId;
            const homeFlag = getTeamFlag(game, "home");
            const awayFlag = getTeamFlag(game, "away");
            const status = getStatus(game);
            let scoreCellHtml = "";
            if (status === "upcoming") {
              const dateLabel = isToday(game)
                ? "Hoy"
                : formatKickoffDateShort(game);
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
          })
          .join("")}
      </section>
    `,
      )
      .join("") +
    (hasMoreAllViewDays()
      ? `
        <button class="load-more-matches" type="button">
          Ver mas partidos
        </button>
      `
      : "");

}

function renderGroups() {
  const groups = [
    ...new Set([
      ...state.payload.teams
        .map((team) => team.groups)
        .filter((group): group is string => Boolean(group)),
      ...state.payload.games
        .map((game) => game.group)
        .filter(
          (group): group is string => Boolean(group) && group !== "Knockout",
        ),
      ...state.payload.groups
        .map((group) => String(group.group))
        .filter(Boolean),
    ]),
  ].sort();
  groupFilterEl.innerHTML = `<option value="all">Todos los grupos</option>${groups.map((group) => `<option value="${escapeHtml(group)}">Group ${escapeHtml(group)}</option>`).join("")}`;
  groupFilterEl.value = state.activeGroup;
  const visibleGroups = visibleGroupsForCurrentContext();

  const standingsByGroup = new Map<string, ApiGroupStanding>();
  state.payload.groups.forEach((group) => {
    standingsByGroup.set(String(group.group), {
      group: String(group.group),
      teams: [...(group.teams ?? [])],
    });
  });

  groups.forEach((group) => {
    const current = standingsByGroup.get(group) ?? { group, teams: [] };
    const existingTeamIds = new Set(
      (current.teams ?? []).map((team) => team.team_id),
    );
    state.payload.teams
      .filter((team) => team.groups === group && !existingTeamIds.has(team.id))
      .forEach((team) => {
        current.teams = [
          ...(current.teams ?? []),
          {
            team_id: team.id,
            mp: 0,
            w: 0,
            d: 0,
            l: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0,
          },
        ];
      });
    standingsByGroup.set(group, current);
  });

  const standings = [...standingsByGroup.values()].length
    ? [...standingsByGroup.values()]
    : groups.map((group) => ({
        group,
        teams: state.payload.teams
          .filter((team) => team.groups === group)
          .map((team) => ({
            team_id: team.id,
            mp: 0,
            w: 0,
            d: 0,
            l: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0,
          })),
      }));

  const groupsHtml =
    standings
      .filter(
        (group) => !visibleGroups || visibleGroups.has(String(group.group)),
      )
      .sort((a, b) => String(a.group).localeCompare(String(b.group)))
      .map((group) => {
        const rows = [...(group.teams ?? [])].sort(
          (a, b) =>
            Number(b.pts) - Number(a.pts) || Number(b.gd) - Number(a.gd),
        );
        return `
        <section class="standings-card">
          <div class="standings-card-head">
            <h3>Grupo ${escapeHtml(group.group)}</h3>
            <span>${rows.length} equipos</span>
          </div>
          <div class="standings-table">
            <div class="standings-row standings-row-head">
              <span>#</span>
              <span></span>
              <span>PJ</span>
              <span>DG</span>
              <span>PTS</span>
            </div>
            ${rows
              .map((row, index) => {
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
              })
              .join("")}
          </div>
        </section>
      `;
      })
      .join("") || `<p class="empty-copy">No hay grupos para este filtro.</p>`;

  groupGridEls.forEach((groupsEl) => {
    groupsEl.innerHTML = groupsHtml;
  });
}

function renderKnockoutBracket() {
  const roundOrder = ["r16", "qf", "sf", "third", "final"] as const;
  const knockoutGames = [...state.payload.games]
    .filter((game) =>
      roundOrder.includes(game.type as (typeof roundOrder)[number]),
    )
    .sort(
      (a, b) =>
        parseLocalDate(a.local_date).getTime() -
        parseLocalDate(b.local_date).getTime(),
    );

  if (!knockoutGames.length) {
    knockoutEl.innerHTML = `
      <div class="bracket-empty">
        <strong>Llave pendiente</strong>
        <span>ESPN todavia no publico los cruces de eliminacion directa en el feed.</span>
      </div>
    `;
    return;
  }

  const gamesByRound = {
    r16: knockoutGames.filter((game) => game.type === "r16"),
    qf: knockoutGames.filter((game) => game.type === "qf"),
    sf: knockoutGames.filter((game) => game.type === "sf"),
    third: knockoutGames.filter((game) => game.type === "third"),
    final: knockoutGames.filter((game) => game.type === "final"),
  };

  const slots = [
    { key: "r16-1", game: gamesByRound.r16[0], x: 14, y: 1 },
    { key: "r16-2", game: gamesByRound.r16[1], x: 38.5, y: 1 },
    { key: "r16-3", game: gamesByRound.r16[2], x: 63, y: 1 },
    { key: "r16-4", game: gamesByRound.r16[3], x: 87.5, y: 1 },
    { key: "qf-1", game: gamesByRound.qf[0], x: 26.25, y: 16.5 },
    { key: "qf-2", game: gamesByRound.qf[1], x: 75.25, y: 16.5 },
    { key: "sf-1", game: gamesByRound.sf[0], x: 50, y: 33.5 },
    {
      key: "third",
      game: gamesByRound.third[0],
      x: 18,
      y: 46.5,
      label: "TERCER LUGAR",
    },
    {
      key: "final",
      game: gamesByRound.final[0],
      x: 50,
      y: 46.5,
      label: "FINAL",
    },
    { key: "sf-2", game: gamesByRound.sf[1], x: 50, y: 59 },
    { key: "qf-3", game: gamesByRound.qf[2], x: 26.25, y: 74.5 },
    { key: "qf-4", game: gamesByRound.qf[3], x: 75.25, y: 74.5 },
    { key: "r16-5", game: gamesByRound.r16[4], x: 14, y: 87.5 },
    { key: "r16-6", game: gamesByRound.r16[5], x: 38.5, y: 87.5 },
    { key: "r16-7", game: gamesByRound.r16[6], x: 63, y: 87.5 },
    { key: "r16-8", game: gamesByRound.r16[7], x: 87.5, y: 87.5 },
  ];

  knockoutEl.innerHTML = `
    <div class="bracket-tree">
      ${slots.map((slot) => renderBracketSlot(slot.game, slot.x, slot.y, slot.key, slot.label)).join("")}
      <div class="champion-node" style="left: 82%; top: 46%;">
        <div class="trophy-shape" aria-hidden="true">
          <span></span>
        </div>
        <strong>Campeón</strong>
      </div>
    </div>
  `;

}

function renderBracketSlot(
  game: ApiGame | undefined,
  x: number,
  y: number,
  key: string,
  label?: string,
) {
  if (!game) {
    return `
      <div class="bracket-game bracket-placeholder" data-slot="${escapeHtml(key)}" style="left: ${x}%; top: ${y}%;">
        <span class="bracket-team"><span class="bracket-seed"></span><strong>Por definir</strong><b></b></span>
        <span class="bracket-team"><span class="bracket-seed"></span><strong>Por definir</strong><b></b></span>
        <small>${escapeHtml(label ?? "Por definir")}</small>
      </div>
    `;
  }

  const selected = game.id === state.selectedMatchId;
  const status = getStatus(game);
  const homeFlag = getTeamFlag(game, "home");
  const awayFlag = getTeamFlag(game, "away");
  const homeName = getBracketTeamLabel(game, "home", key);
  const awayName = getBracketTeamLabel(game, "away", key);
  const homeScore =
    status === "upcoming" ? "" : String(Number(game.home_score) || 0);
  const awayScore =
    status === "upcoming" ? "" : String(Number(game.away_score) || 0);
  return `
    <button class="bracket-game ${selected ? "selected" : ""}" data-match-id="${game.id}" data-slot="${escapeHtml(key)}" style="left: ${x}%; top: ${y}%;" type="button">
      <span class="bracket-team">
        ${homeFlag ? `<img src="${safeUrl(homeFlag)}" alt="">` : `<span class="bracket-seed"></span>`}
        <strong>${escapeHtml(homeName)}</strong>
        <b>${escapeHtml(homeScore)}</b>
      </span>
      <span class="bracket-team">
        ${awayFlag ? `<img src="${safeUrl(awayFlag)}" alt="">` : `<span class="bracket-seed"></span>`}
        <strong>${escapeHtml(awayName)}</strong>
        <b>${escapeHtml(awayScore)}</b>
      </span>
      <small>${escapeHtml(formatBracketDate(game))}</small>
      ${label ? `<em>${escapeHtml(label)}</em>` : ""}
    </button>
  `;
}

function getBracketTeamLabel(
  game: ApiGame,
  side: "home" | "away",
  slotKey: string,
) {
  const name = getTeamName(game, side);
  if (!/winner|place|round|quarterfinal|semifinal|final/i.test(name))
    return name;

  const compactSeeds: Record<string, [string, string]> = {
    "r16-1": ["1EA", "1C"],
    "r16-2": ["2AB", "1FC"],
    "r16-3": ["2K", "1HJ"],
    "r16-4": ["1DB", "1GA"],
    "r16-5": ["1CF", "2EI"],
    "r16-6": ["1AC", "1LE"],
    "r16-7": ["1JH", "2DG"],
    "r16-8": ["1BE", "1KD"],
    "qf-1": ["EF1", "EF2"],
    "qf-2": ["EF5", "EF6"],
    "qf-3": ["EF3", "EF4"],
    "qf-4": ["EF7", "EF8"],
    "sf-1": ["WQ1", "WQ2"],
    "sf-2": ["WQ3", "WQ4"],
    final: ["WS1", "WS2"],
    third: ["LS1", "LS2"],
  };
  const labels = compactSeeds[slotKey];
  return labels ? labels[side === "home" ? 0 : 1] : name;
}

function renderDetail() {
  const game =
    state.payload.games.find((item) => item.id === state.selectedMatchId) ??
    state.payload.games[0];
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
  const statusText =
    status === "finished"
      ? "Finalizado"
      : status === "live"
        ? String(game.time_elapsed)
        : formatKickoffDateTime(game);
  const headlineText = game.headline?.text || game.headline?.description;
  const factsPanel = `
    ${
      headlineText
        ? `
      <div class="headline-box">
        <span>${escapeHtml(game.headline?.type ?? "ESPN")}</span>
        <strong>${escapeHtml(headlineText)}</strong>
      </div>
    `
        : ""
    }

    <div class="selected-facts">
      <div>
        <span>Fase</span>
        <strong>${escapeHtml(stageLabels[game.type] ?? game.type)}</strong>
      </div>
      ${
        game.group && game.group !== "Knockout"
          ? `
      <div>
        <span>Grupo</span>
        <strong>${escapeHtml(game.group)}</strong>
      </div>
      `
          : ""
      }
      <div>
        <span>Goles</span>
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
      ${
        events.length
          ? events
              .map(
                (event) => `
        <div class="event-row" data-kind="${event.kind}">
          <span>${escapeHtml(event.minute || "--")}</span>
          <strong>${escapeHtml(event.type)}</strong>
          <p>${escapeHtml(event.player)}</p>
        </div>
      `,
              )
              .join("")
          : `<p class="empty-copy">Sin eventos disponibles para este partido.</p>`
      }
    </div>
  `;
  const tvPanel = renderTvPanel(broadcasts, links);
  const activePanel =
    state.activeDetailTab === "events"
      ? eventsPanel
      : state.activeDetailTab === "tv"
        ? tvPanel
        : factsPanel;

  const detailHtml = `
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
        </div>

        <div class="selected-score" data-status="${status}">
          <strong>${Number(game.home_score) || 0} - ${Number(game.away_score) || 0}</strong>
          <span class="${status === "live" ? "selected-live-time" : ""}">${escapeHtml(statusText)}</span>
        </div>

        <div class="selected-team">
          ${awayFlag ? `<img src="${safeUrl(awayFlag)}" alt="">` : ""}
          <strong>${escapeHtml(getTeamName(game, "away"))}</strong>
        </div>
      </div>

      <div class="selected-tabs" role="tablist" aria-label="Detalle del partido">
        <button type="button" data-detail-tab="facts" data-active="${state.activeDetailTab === "facts"}" role="tab" aria-selected="${state.activeDetailTab === "facts"}">Datos</button>
        <button type="button" data-detail-tab="events" data-active="${state.activeDetailTab === "events"}" role="tab" aria-selected="${state.activeDetailTab === "events"}">Eventos</button>
        <button type="button" data-detail-tab="tv" data-active="${state.activeDetailTab === "tv"}" role="tab" aria-selected="${state.activeDetailTab === "tv"}">TV</button>
      </div>

      <div class="detail-tab-panel" role="tabpanel">
        ${activePanel}
      </div>
    </article>
  `;

  const isMobile = isMobileViewport();
  const showInlineDetail =
    isMobile && state.activeSection === "detail" && detailMobileEl;
  if (showInlineDetail) {
    detailMobileEl.innerHTML = detailHtml;
    detailEl.innerHTML = "";
  } else {
    detailEl.innerHTML = detailHtml;
  }

  if (rootEl) {
    rootEl.dataset.mobileDetailOpen = String(
      isMobileViewport() && !isTableViewport() && state.mobileDetailOpen,
    );
  }
}

function renderMeta() {
  updatedEl.textContent = formatMetaTime(new Date(state.payload.updatedAt));
  const sourceLabel: Record<WorldCupPayload["source"], string> = {
    espn: "ESPN publico",
    worldcup26: "worldcup26.ir",
    fallback: "demo local",
  };
  sourceEl.textContent = sourceLabel[state.payload.source];
}

function renderDateControls() {
  dateLabelEl.textContent =
    state.activeView === "today"
      ? "Hoy"
      : state.activeView === "all"
        ? "Todos"
        : formatDateLabel(state.activeDate);
}

function renderActiveSection() {
  const isMobile = isMobileViewport();
  const isTablet = isTableViewport();
  const isPhone = isMobile && !isTablet;
  matchesEl.hidden = state.activeSection !== "matches";
  bracketShellEl.hidden = state.activeSection !== "bracket";

  if (feedGroupsEl) {
    feedGroupsEl.hidden = !(
      (state.activeSection === "detail" && isPhone) ||
      (state.activeSection === "groups" && isPhone)
    );
  }

  if (detailMobileEl) {
    detailMobileEl.hidden =
      state.activeSection !== "detail" || !(isPhone || isTablet);
  }

  if (rootEl) {
    rootEl.dataset.mobileDetailOpen = String(
      state.activeSection === "detail" && isPhone,
    );
  }

  sectionLinks.forEach((link) => {
    const isActive = link.dataset.sectionLink === state.activeSection;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function setMobileMenuOpen(isOpen: boolean) {
  if (!mobileMenuEl || !mobileMenuToggleEl) return;
  mobileMenuEl.hidden = !isOpen;
  mobileMenuToggleEl.setAttribute("aria-expanded", String(isOpen));
  mobileMenuToggleEl.setAttribute(
    "aria-label",
    isOpen ? "Cerrar menu" : "Abrir menu",
  );
}

function resetAllFilters() {
  state.activeSection = "matches";
  state.activeView = "all";
  state.activeGroup = "all";
  state.visibleDayCount = 3;
  state.selectedMatchId = pickInitialMatchId();
  state.query = "";
  state.activeDate = null;
  state.activeDetailTab = "facts";
  state.mobileDetailOpen = false;
  state.selectedByUser = false;
  groupFilterEl.value = "all";
  searchEl.value = "";
}

function render() {
  renderMeta();
  renderDateControls();
  renderMatches();
  renderGroups();
  renderKnockoutBracket();
  renderActiveSection();
  renderDetail();
}

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    state.activeSection =
      (link.dataset.sectionLink as ActiveSection) ?? "matches";
    window.history.replaceState(
      null,
      "",
      link.getAttribute("href") ?? "#matches",
    );
    if (state.activeSection === "detail") {
      state.selectedMatchId = pickInitialMatchId();
      state.selectedByUser = false;
      const detailGame = state.payload.games.find(
        (g) => g.id === state.selectedMatchId,
      );
      if (detailGame?.group && detailGame.group !== "Knockout") {
        state.activeGroup = detailGame.group;
      }
    }
    setMobileMenuOpen(false);
    render();
  });
});

mobileMenuToggleEl.addEventListener("click", () => {
  setMobileMenuOpen(
    mobileMenuToggleEl.getAttribute("aria-expanded") !== "true",
  );
});

mobileMenuEl.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMobileMenuOpen(false);
  });
});

let bannerTimer: ReturnType<typeof setInterval> | null = null;

function setBannerBtnText(label: string, countdown = "") {
  if (!ligaMxBannerToggleEl) return;
  const textSpan = document.querySelector(
    "#banner-toggle-text",
  ) as HTMLElement | null;
  const cdSpan = document.querySelector(
    "#banner-countdown",
  ) as HTMLElement | null;
  if (textSpan) textSpan.textContent = label;
  if (cdSpan) {
    cdSpan.textContent = countdown;
    cdSpan.classList.remove("countdown-pulse");
    void cdSpan.offsetWidth;
    cdSpan.classList.add("countdown-pulse");
  }
}

function startBannerCountdown() {
  clearBannerTimer();
  let seconds = 15;
  setBannerBtnText("Minimizar", `${seconds}s`);
  bannerTimer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearBannerTimer();
      if (ligaMxBannerEl) {
        ligaMxBannerEl.dataset.minimized = "true";
        setBannerBtnText("Mostrar");
      }
    } else {
      setBannerBtnText("Minimizar", `${seconds}s`);
    }
  }, 1000);
}

function clearBannerTimer() {
  if (bannerTimer !== null) {
    clearInterval(bannerTimer);
    bannerTimer = null;
  }
}

ligaMxBannerToggleEl?.addEventListener("click", () => {
  if (!ligaMxBannerEl) return;
  const isMinimized = ligaMxBannerEl.dataset.minimized === "true";
  ligaMxBannerEl.dataset.minimized = String(!isMinimized);
  ligaMxBannerToggleEl.setAttribute("aria-expanded", String(isMinimized));
  if (isMinimized) {
    startBannerCountdown();
  } else {
    clearBannerTimer();
    setBannerBtnText("Mostrar");
  }
});

startBannerCountdown();

document
  .querySelectorAll<HTMLButtonElement>("[data-view]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const nextView = (button.dataset.view as ActiveView) ?? "all";
      if (nextView === "all") {
        resetAllFilters();
      } else {
        state.activeSection = "matches";
        state.activeView = nextView;
        state.visibleDayCount = 3;
        state.activeDate = state.activeView === "today" ? new Date() : null;
      }
      document
        .querySelectorAll<HTMLButtonElement>("[data-view]")
        .forEach((item) => {
          item.dataset.active = String(item === button);
        });
      render();
    });
  });

dateButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    state.activeSection = "matches";
    state.visibleDayCount = 3;
    const direction = index === 0 ? -1 : 1;
    state.activeDate = addDays(state.activeDate ?? new Date(), direction);
    state.activeView = "date";
    document
      .querySelectorAll<HTMLButtonElement>("[data-view]")
      .forEach((item) => {
        item.dataset.active = "false";
      });
    render();
  });
});

groupFilterEl.addEventListener("change", () => {
  state.activeSection = "matches";
  state.visibleDayCount = 3;
  state.activeGroup = groupFilterEl.value;
  state.selectedByUser = false;
  render();
});

searchEl.addEventListener("input", () => {
  if (state.activeSection !== "groups") {
    state.activeSection = "matches";
    state.visibleDayCount = 3;
  }
  state.query = searchEl.value.trim();
  state.selectedByUser = false;
  render();
});

filterToggleEl.addEventListener("click", () => {
  const isOpen = dateCardEl.dataset.filtersOpen === "true";
  dateCardEl.dataset.filtersOpen = String(!isOpen);
  filterToggleEl.setAttribute("aria-expanded", String(!isOpen));
});

$("#refresh").addEventListener("click", () => {
  isManualRefresh = true;
  loadWorldCupData();
});

let lastViewportWidth = window.innerWidth;
window.addEventListener("resize", () => {
  const currentWidth = window.innerWidth;
  const wasMobile = lastViewportWidth <= 1279;
  const isNowDesktop = currentWidth > 1279;

  if (wasMobile && isNowDesktop) {
    state.mobileDetailOpen = false;
    setMobileMenuOpen(false);
    render();
  }

  lastViewportWidth = currentWidth;
});

function initEventDelegation() {
  matchesEl.addEventListener("click", (event) => {
    const matchCard = (event.target as HTMLElement).closest<HTMLButtonElement>(".match-card");
    if (matchCard) {
      state.selectedMatchId = matchCard.dataset.matchId ?? state.selectedMatchId;
      state.selectedByUser = true;
      state.activeDetailTab = "facts";
      if (isMobileViewport() && !isTableViewport()) {
        state.activeSection = "detail";
        state.mobileDetailOpen = false;
        const matchGame = state.payload.games.find(
          (g) => g.id === state.selectedMatchId,
        );
        if (matchGame?.group && matchGame.group !== "Knockout") {
          state.activeGroup = matchGame.group;
        }
      } else {
        state.mobileDetailOpen = false;
      }
      render();
      return;
    }

    const loadMoreButton = (event.target as HTMLElement).closest<HTMLButtonElement>(".load-more-matches");
    if (loadMoreButton) {
      state.visibleDayCount += 3;
      render();
    }
  });

  knockoutEl.addEventListener("click", (event) => {
    const bracketGame = (event.target as HTMLElement).closest<HTMLButtonElement>(".bracket-game");
    if (bracketGame) {
      state.selectedMatchId = bracketGame.dataset.matchId ?? state.selectedMatchId;
      state.selectedByUser = true;
      state.activeDetailTab = "facts";
      if (isMobileViewport() && !isTableViewport()) {
        state.mobileDetailOpen = true;
      }
      render();
    }
  });

  const handleDetailTabClick = (event: Event) => {
    const tabButton = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-detail-tab]");
    if (tabButton) {
      state.activeDetailTab = (tabButton.dataset.detailTab as DetailTab) ?? "facts";
      renderDetail();
    }
  };
  detailEl.addEventListener("click", handleDetailTabClick);
  if (detailMobileEl) {
    detailMobileEl.addEventListener("click", handleDetailTabClick);
  }

  const handleDetailCloseClick = (event: Event) => {
    const closeButton = (event.target as HTMLElement).closest<HTMLButtonElement>(".detail-close");
    if (closeButton) {
      resetAllFilters();
      render();
    }
  };
  detailEl.addEventListener("click", handleDetailCloseClick);
  if (detailMobileEl) {
    detailMobileEl.addEventListener("click", handleDetailCloseClick);
  }
}

initEventDelegation();

state.selectedMatchId = pickInitialMatchId();
render();
loadWorldCupData();
