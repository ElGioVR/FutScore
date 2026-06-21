import {
  ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL,
  fallbackPayload,
  WORLDCUP26_BASE_URL,
  type ApiGame,
  type ApiGroupStanding,
  type ApiStadium,
  type ApiTeam,
  type ApiTeamStat,
  type WorldCupPayload,
} from "@/lib/worldcup26";
import { fetchJson } from "@/lib/fetch";

export const prerender = false;

type EspnScoreboard = {
  events?: EspnEvent[];
};

type EspnEvent = {
  id: string;
  date: string;
  name?: string;
  links?: Array<{
    text?: string;
    shortText?: string;
    href?: string;
    isHidden?: boolean;
  }>;
  season?: {
    slug?: string;
  };
  competitions?: EspnCompetition[];
};

type EspnCompetition = {
  id: string;
  date: string;
  attendance?: number;
  status: {
    period?: number;
    displayClock?: string;
    type: {
      state: "pre" | "in" | "post";
      completed: boolean;
      description?: string;
      detail?: string;
      shortDetail?: string;
    };
  };
  venue?: {
    id?: string;
    fullName?: string;
    displayName?: string;
    address?: {
      city?: string;
      country?: string;
    };
  };
  competitors: EspnCompetitor[];
  broadcasts?: Array<{
    names?: string[];
  }>;
  geoBroadcasts?: Array<{
    media?: {
      shortName?: string;
    };
  }>;
  details?: EspnDetail[];
  headlines?: Array<{
    type?: string;
    shortLinkText?: string;
    description?: string;
  }>;
  altGameNote?: string;
};

type EspnCompetitor = {
  id: string;
  homeAway: "home" | "away";
  score?: string;
  team: {
    id: string;
    abbreviation?: string;
    displayName: string;
    shortDisplayName?: string;
    logo?: string;
  };
  statistics?: Array<{
    name: string;
    abbreviation?: string;
    displayValue?: string;
  }>;
};

type EspnDetail = {
  type?: {
    text?: string;
  };
  scoringPlay?: boolean;
  yellowCard?: boolean;
  redCard?: boolean;
  ownGoal?: boolean;
  team?: {
    id: string;
  };
  clock?: {
    displayValue?: string;
  };
  athletesInvolved?: Array<{
    displayName?: string;
    shortName?: string;
  }>;
};



function normalizeKickoffDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function extractGroup(value = "") {
  const match = value.match(/(?:Group|Grupo)\s+([A-L])/i);
  return match?.[1]?.toUpperCase() ?? "Knockout";
}

function mapStage(event: EspnEvent, note = "") {
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

function mapStatus(status: EspnCompetition["status"]) {
  if (status.type.completed || status.type.state === "post") {
    return {
      finished: "TRUE",
      time_elapsed: "finished",
      status_detail: status.type.detail || status.type.shortDetail || status.type.description || "FT",
      period: status.period,
      clock: status.displayClock,
    };
  }

  if (status.type.state === "pre") {
    return {
      finished: "FALSE",
      time_elapsed: "notstarted",
      status_detail: status.type.detail || status.type.shortDetail || status.type.description || "Programado",
      period: status.period,
      clock: status.displayClock,
    };
  }

  return {
    finished: "FALSE",
    time_elapsed: status.displayClock || status.type.shortDetail || status.type.detail || "live",
      status_detail: status.type.detail || status.type.shortDetail || status.type.description || "En vivo",
    period: status.period,
    clock: status.displayClock,
  };
}

function scorerText(details: EspnDetail[] | undefined, teamId: string) {
  const scorers = (details ?? [])
    .filter((detail) => detail.scoringPlay && detail.team?.id === teamId)
    .map((detail) => {
      const athlete = detail.athletesInvolved?.[0];
      const name = athlete?.displayName ?? athlete?.shortName ?? "Gol";
      const minute = detail.clock?.displayValue ? ` ${detail.clock.displayValue}` : "";
      const ownGoal = detail.ownGoal ? " (AG)" : "";
      return `${name}${ownGoal}${minute}`;
    });

  return scorers.length ? `{${scorers.map((item) => `"${item}"`).join(",")}}` : "null";
}

function eventKind(detail: EspnDetail): NonNullable<ApiGame["events"]>[number]["kind"] {
  if (detail.scoringPlay) return "goal";
  if (detail.redCard) return "red-card";
  if (detail.yellowCard) return "yellow-card";
  return "event";
}

function normalizeEvents(details: EspnDetail[] | undefined): ApiGame["events"] {
  return (details ?? [])
    .filter((detail) => detail.scoringPlay || detail.yellowCard || detail.redCard)
    .map((detail) => {
      const athlete = detail.athletesInvolved?.[0];
      return {
        minute: detail.clock?.displayValue ?? "",
        type: detail.type?.text ?? "Evento",
        player: athlete?.displayName ?? athlete?.shortName ?? "Sin jugador",
        team_id: detail.team?.id,
        kind: eventKind(detail),
      };
    });
}

function normalizeBroadcasts(competition: EspnCompetition) {
  const broadcastNames = (competition.broadcasts ?? []).flatMap((broadcast) => broadcast.names ?? []);
  const geoNames = (competition.geoBroadcasts ?? []).map((broadcast) => broadcast.media?.shortName).filter(Boolean) as string[];
  return [...new Set([...broadcastNames, ...geoNames])];
}

function normalizeLinks(event: EspnEvent): ApiGame["links"] {
  return (event.links ?? [])
    .filter((link) => link.href && !link.isHidden)
    .map((link) => ({
      text: link.shortText ?? link.text ?? "ESPN",
      href: link.href as string,
    }));
}

const statLabels: Record<string, string> = {
  foulsCommitted: "Faltas",
  goalAssists: "Asistencias",
  possessionPct: "Posesion",
  shotsOnTarget: "Tiros a puerta",
  totalGoals: "Goles",
  totalShots: "Tiros",
  wonCorners: "Corners",
};

function normalizeStats(competitor: EspnCompetitor): ApiTeamStat[] {
  return (competitor.statistics ?? [])
    .filter((stat) => stat.displayValue && statLabels[stat.name])
    .map((stat) => ({
      name: stat.name,
      abbreviation: stat.abbreviation,
      label: statLabels[stat.name],
      value: stat.displayValue as string,
    }));
}

function normalizeHeadline(competition: EspnCompetition): ApiGame["headline"] {
  const headline = competition.headlines?.find((item) => item.shortLinkText || item.description);
  if (!headline) return undefined;
  return {
    type: headline.type,
    text: headline.shortLinkText ?? headline.description ?? "",
    description: headline.description,
  };
}

function upsertTeam(teams: Map<string, ApiTeam>, competitor: EspnCompetitor, group?: string) {
  const current = teams.get(competitor.id);
  teams.set(competitor.id, {
    id: competitor.id,
    name_en: competitor.team.displayName,
    fifa_code: competitor.team.abbreviation,
    flag: competitor.team.logo,
    groups: current?.groups ?? group,
  });
}

function normalizeEspnPayload(scoreboard: EspnScoreboard): WorldCupPayload {
  const teams = new Map<string, ApiTeam>();
  const stadiums = new Map<string, ApiStadium>();
  const groupByTeamId = new Map<string, string>();

  const games: ApiGame[] = (scoreboard.events ?? []).flatMap((event) => {
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
        country_en: competition.venue?.address?.country,
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
        away: normalizeStats(away),
      },
      links: normalizeLinks(event),
      events: normalizeEvents(competition.details),
      ...status,
    };
  });

  return {
    games,
    teams: [...teams.values()],
    stadiums: [...stadiums.values()],
    groups: buildGroupStandings(games, teams, groupByTeamId),
    source: "espn",
    updatedAt: new Date().toISOString(),
  };
}

function buildGroupStandings(games: ApiGame[], teams: Map<string, ApiTeam>, groupByTeamId: Map<string, string>): ApiGroupStanding[] {
  type StandingRow = NonNullable<ApiGroupStanding["teams"]>[number];
  const rows = new Map<string, StandingRow>();

  teams.forEach((team) => {
    const group = team.groups ?? groupByTeamId.get(team.id);
    if (!group) return;
    rows.set(team.id, { team_id: team.id, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  });

  games
    .filter((game) => game.type === "group" && game.time_elapsed !== "notstarted")
    .forEach((game) => {
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

  const byGroup = new Map<string, StandingRow[]>();
  rows.forEach((row) => {
    const team = teams.get(row.team_id);
    const group = team?.groups ?? groupByTeamId.get(row.team_id);
    if (!group) return;
    byGroup.set(group, [...(byGroup.get(group) ?? []), row]);
  });

  return [...byGroup.entries()].map(([group, groupRows]) => ({
    group,
    teams: groupRows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf),
  }));
}

async function getEspnPayload(): Promise<WorldCupPayload> {
  const url = new URL(ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL);
  url.searchParams.set("dates", "20260611-20260719");
  url.searchParams.set("limit", "300");

  const scoreboard = await fetchJson<EspnScoreboard>(url.toString(), {
    timeoutMs: 22000,
    retries: 3,
    retryDelay: (attempt) => attempt * 650,
  });
  const payload = normalizeEspnPayload(scoreboard);
  if (!payload.games.length) throw new Error("ESPN returned an empty World Cup feed");
  return payload;
}

async function getWorldCup26Payload(): Promise<WorldCupPayload> {
  const [gamesResult, teamsResult, stadiumsResult, groupsResult] = await Promise.allSettled([
    fetchJson<{ games: ApiGame[] }>(`${WORLDCUP26_BASE_URL}/get/games`, {
      timeoutMs: 26000,
      retries: 4,
      retryDelay: (attempt) => attempt * 650,
    }),
    fetchJson<{ teams: ApiTeam[] }>(`${WORLDCUP26_BASE_URL}/get/teams`, {
      timeoutMs: 16000,
      retries: 3,
      retryDelay: (attempt) => attempt * 650,
    }),
    fetchJson<{ stadiums: ApiStadium[] }>(`${WORLDCUP26_BASE_URL}/get/stadiums`, {
      timeoutMs: 16000,
      retries: 2,
      retryDelay: (attempt) => attempt * 650,
    }),
    fetchJson<{ groups: ApiGroupStanding[] }>(`${WORLDCUP26_BASE_URL}/get/groups`, {
      timeoutMs: 16000,
      retries: 3,
      retryDelay: (attempt) => attempt * 650,
    }),
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
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const payload = await getEspnPayload();
    return Response.json(payload, {
      headers: {
        "cache-control": "s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (espnError) {
    console.warn("ESPN unavailable; trying worldcup26.", espnError instanceof Error ? espnError.message : espnError);
  }

  try {
    const payload = await getWorldCup26Payload();
    return Response.json(payload, {
      headers: {
        "cache-control": "s-maxage=20, stale-while-revalidate=120",
      },
    });
  } catch (worldCup26Error) {
    console.warn("World Cup feeds unavailable; using fallback data.", worldCup26Error instanceof Error ? worldCup26Error.message : worldCup26Error);
    return Response.json(
      {
        ...fallbackPayload,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
