import { f as fallbackPayload, E as ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL, W as WORLDCUP26_BASE_URL } from '../../chunks/worldcup26_C0AivYp6.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function fetchJson(url, timeoutMs = 16e3) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    signal: controller.signal,
    headers: {
      accept: "application/json",
      "user-agent": "FutScore/1.0"
    }
  }).then((response) => {
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  }).finally(() => clearTimeout(timeout));
}
async function fetchJsonWithRetry(url, timeoutMs = 16e3, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchJson(url, timeoutMs);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 650));
    }
  }
  throw lastError;
}
function normalizeKickoffDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
function extractGroup(value = "") {
  const match = value.match(/Group\s+([A-L])/i);
  return match?.[1]?.toUpperCase() ?? "Knockout";
}
function mapStage(event, note = "") {
  const slug = event.season?.slug?.toLowerCase() ?? "";
  if (slug.includes("round-of-32")) return "r32";
  if (slug.includes("round-of-16")) return "r16";
  if (slug.includes("quarter")) return "qf";
  if (slug.includes("semi")) return "sf";
  if (slug.includes("third") || slug.includes("3rd")) return "third";
  if (slug.includes("final")) return "final";
  if (/group/i.test(note) || slug.includes("group")) return "group";
  return "knockout";
}
function mapStatus(status) {
  if (status.type.completed || status.type.state === "post") {
    return {
      finished: "TRUE",
      time_elapsed: "finished",
      status_detail: status.type.detail || status.type.shortDetail || status.type.description || "FT",
      period: status.period,
      clock: status.displayClock
    };
  }
  if (status.type.state === "pre") {
    return {
      finished: "FALSE",
      time_elapsed: "notstarted",
      status_detail: status.type.detail || status.type.shortDetail || status.type.description || "Scheduled",
      period: status.period,
      clock: status.displayClock
    };
  }
  return {
    finished: "FALSE",
    time_elapsed: status.displayClock || status.type.shortDetail || status.type.detail || "live",
    status_detail: status.type.detail || status.type.shortDetail || status.type.description || "Live",
    period: status.period,
    clock: status.displayClock
  };
}
function scorerText(details, teamId) {
  const scorers = (details ?? []).filter((detail) => detail.scoringPlay && detail.team?.id === teamId).map((detail) => {
    const athlete = detail.athletesInvolved?.[0];
    const name = athlete?.displayName ?? athlete?.shortName ?? "Gol";
    const minute = detail.clock?.displayValue ? ` ${detail.clock.displayValue}` : "";
    const ownGoal = detail.ownGoal ? " (AG)" : "";
    return `${name}${ownGoal}${minute}`;
  });
  return scorers.length ? `{${scorers.map((item) => `"${item}"`).join(",")}}` : "null";
}
function eventKind(detail) {
  if (detail.scoringPlay) return "goal";
  if (detail.redCard) return "red-card";
  if (detail.yellowCard) return "yellow-card";
  return "event";
}
function normalizeEvents(details) {
  return (details ?? []).filter((detail) => detail.scoringPlay || detail.yellowCard || detail.redCard).map((detail) => {
    const athlete = detail.athletesInvolved?.[0];
    return {
      minute: detail.clock?.displayValue ?? "",
      type: detail.type?.text ?? "Event",
      player: athlete?.displayName ?? athlete?.shortName ?? "Sin jugador",
      team_id: detail.team?.id,
      kind: eventKind(detail)
    };
  });
}
function normalizeBroadcasts(competition) {
  const broadcastNames = (competition.broadcasts ?? []).flatMap((broadcast) => broadcast.names ?? []);
  const geoNames = (competition.geoBroadcasts ?? []).map((broadcast) => broadcast.media?.shortName).filter(Boolean);
  return [.../* @__PURE__ */ new Set([...broadcastNames, ...geoNames])];
}
function normalizeLinks(event) {
  return (event.links ?? []).filter((link) => link.href && !link.isHidden).map((link) => ({
    text: link.shortText ?? link.text ?? "ESPN",
    href: link.href
  }));
}
const statLabels = {
  foulsCommitted: "Faltas",
  goalAssists: "Asistencias",
  possessionPct: "Posesion",
  shotsOnTarget: "Tiros a puerta",
  totalGoals: "Goles",
  totalShots: "Tiros",
  wonCorners: "Corners"
};
function normalizeStats(competitor) {
  return (competitor.statistics ?? []).filter((stat) => stat.displayValue && statLabels[stat.name]).map((stat) => ({
    name: stat.name,
    abbreviation: stat.abbreviation,
    label: statLabels[stat.name],
    value: stat.displayValue
  }));
}
function normalizeHeadline(competition) {
  const headline = competition.headlines?.find((item) => item.shortLinkText || item.description);
  if (!headline) return void 0;
  return {
    type: headline.type,
    text: headline.shortLinkText ?? headline.description ?? "",
    description: headline.description
  };
}
function upsertTeam(teams, competitor, group) {
  const current = teams.get(competitor.id);
  teams.set(competitor.id, {
    id: competitor.id,
    name_en: competitor.team.displayName,
    fifa_code: competitor.team.abbreviation,
    flag: competitor.team.logo,
    groups: current?.groups ?? group
  });
}
function normalizeEspnPayload(scoreboard) {
  const teams = /* @__PURE__ */ new Map();
  const stadiums = /* @__PURE__ */ new Map();
  const groupByTeamId = /* @__PURE__ */ new Map();
  const games = (scoreboard.events ?? []).flatMap((event) => {
    const competition = event.competitions?.[0];
    const home = competition?.competitors.find((competitor) => competitor.homeAway === "home");
    const away = competition?.competitors.find((competitor) => competitor.homeAway === "away");
    if (!competition || !home || !away) return [];
    const group = extractGroup(competition.altGameNote);
    const type = mapStage(event, competition.altGameNote);
    const stadiumId = String(competition.venue?.id ?? competition.venue?.fullName ?? "tbd");
    const status = mapStatus(competition.status);
    if (type === "group" && group !== "Knockout") {
      groupByTeamId.set(home.id, group);
      groupByTeamId.set(away.id, group);
    }
    upsertTeam(teams, home, groupByTeamId.get(home.id));
    upsertTeam(teams, away, groupByTeamId.get(away.id));
    if (!stadiums.has(stadiumId)) {
      stadiums.set(stadiumId, {
        id: stadiumId,
        name_en: competition.venue?.fullName ?? competition.venue?.displayName ?? "Por confirmar",
        fifa_name: competition.venue?.displayName ?? competition.venue?.fullName,
        city_en: competition.venue?.address?.city,
        country_en: competition.venue?.address?.country
      });
    }
    return {
      id: event.id,
      home_team_id: home.id,
      away_team_id: away.id,
      home_score: home.score ?? "0",
      away_score: away.score ?? "0",
      home_scorers: scorerText(competition.details, home.id),
      away_scorers: scorerText(competition.details, away.id),
      group,
      matchday: competition.altGameNote ?? event.name ?? "FIFA World Cup",
      local_date: normalizeKickoffDate(competition.date || event.date),
      stadium_id: stadiumId,
      type,
      home_team_name_en: home.team.displayName,
      away_team_name_en: away.team.displayName,
      home_team_flag: home.team.logo,
      away_team_flag: away.team.logo,
      broadcasts: normalizeBroadcasts(competition),
      attendance: competition.attendance,
      headline: normalizeHeadline(competition),
      stats: {
        home: normalizeStats(home),
        away: normalizeStats(away)
      },
      links: normalizeLinks(event),
      events: normalizeEvents(competition.details),
      ...status
    };
  });
  return {
    games,
    teams: [...teams.values()],
    stadiums: [...stadiums.values()],
    groups: buildGroupStandings(games, teams, groupByTeamId),
    source: "espn",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function buildGroupStandings(games, teams, groupByTeamId) {
  const rows = /* @__PURE__ */ new Map();
  teams.forEach((team) => {
    const group = team.groups ?? groupByTeamId.get(team.id);
    if (!group) return;
    rows.set(team.id, { team_id: team.id, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  });
  games.filter((game) => game.type === "group" && game.time_elapsed !== "notstarted").forEach((game) => {
    const home = rows.get(game.home_team_id);
    const away = rows.get(game.away_team_id);
    if (!home || !away) return;
    const homeGoals = Number(game.home_score) || 0;
    const awayGoals = Number(game.away_score) || 0;
    home.mp += 1;
    away.mp += 1;
    home.gf += homeGoals;
    home.ga += awayGoals;
    away.gf += awayGoals;
    away.ga += homeGoals;
    if (homeGoals > awayGoals) {
      home.w += 1;
      away.l += 1;
      home.pts += 3;
    } else if (awayGoals > homeGoals) {
      away.w += 1;
      home.l += 1;
      away.pts += 3;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  });
  const byGroup = /* @__PURE__ */ new Map();
  rows.forEach((row) => {
    const team = teams.get(row.team_id);
    const group = team?.groups ?? groupByTeamId.get(row.team_id);
    if (!group) return;
    byGroup.set(group, [...byGroup.get(group) ?? [], row]);
  });
  return [...byGroup.entries()].map(([group, groupRows]) => ({
    group,
    teams: groupRows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
  }));
}
async function getEspnPayload() {
  const url = new URL(ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL);
  url.searchParams.set("dates", "20260611-20260719");
  url.searchParams.set("limit", "300");
  const scoreboard = await fetchJsonWithRetry(url.toString(), 22e3, 3);
  const payload = normalizeEspnPayload(scoreboard);
  if (!payload.games.length) throw new Error("ESPN returned an empty World Cup feed");
  return payload;
}
async function getWorldCup26Payload() {
  const [gamesResult, teamsResult, stadiumsResult, groupsResult] = await Promise.allSettled([
    fetchJsonWithRetry(`${WORLDCUP26_BASE_URL}/get/games`, 26e3, 4),
    fetchJsonWithRetry(`${WORLDCUP26_BASE_URL}/get/teams`, 16e3, 3),
    fetchJsonWithRetry(`${WORLDCUP26_BASE_URL}/get/stadiums`, 16e3, 2),
    fetchJsonWithRetry(`${WORLDCUP26_BASE_URL}/get/groups`, 16e3, 3)
  ]);
  if (gamesResult.status === "rejected" || teamsResult.status === "rejected") {
    throw new Error("Core World Cup feed unavailable");
  }
  return {
    games: gamesResult.value.games ?? [],
    teams: teamsResult.value.teams ?? [],
    stadiums: stadiumsResult.status === "fulfilled" ? stadiumsResult.value.stadiums ?? [] : fallbackPayload.stadiums,
    groups: groupsResult.status === "fulfilled" ? groupsResult.value.groups ?? [] : fallbackPayload.groups,
    source: "worldcup26",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function GET() {
  try {
    const payload = await getEspnPayload();
    return Response.json(payload, {
      headers: {
        "cache-control": "s-maxage=10, stale-while-revalidate=30"
      }
    });
  } catch (espnError) {
    console.warn("ESPN unavailable; trying worldcup26.", espnError instanceof Error ? espnError.message : espnError);
  }
  try {
    const payload = await getWorldCup26Payload();
    return Response.json(payload, {
      headers: {
        "cache-control": "s-maxage=20, stale-while-revalidate=120"
      }
    });
  } catch (worldCup26Error) {
    console.warn("World Cup feeds unavailable; using fallback data.", worldCup26Error instanceof Error ? worldCup26Error.message : worldCup26Error);
    return Response.json(
      {
        ...fallbackPayload,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
