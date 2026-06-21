export const WORLDCUP26_BASE_URL = "https://worldcup26.ir";
export const ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?lang=es";

export type ApiTeam = {
  id: string;
  name_en: string;
  name_fa?: string;
  flag?: string;
  fifa_code?: string;
  iso2?: string;
  groups?: string;
};

export type ApiStadium = {
  id: string;
  name_en: string;
  fifa_name?: string;
  city_en?: string;
  country_en?: string;
  capacity?: number;
};

export type ApiGroupStanding = {
  group: string;
  teams?: Array<{
    team_id: string;
    mp: number;
    w: number;
    d: number;
    l: number;
    gf: number;
    ga: number;
    gd: number;
    pts: number;
  }>;
};

export type ApiGame = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers?: string;
  away_scorers?: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_flag?: string;
  away_team_flag?: string;
  home_team_label?: string;
  away_team_label?: string;
  broadcasts?: string[];
  attendance?: number;
  status_detail?: string;
  period?: number;
  clock?: string;
  headline?: {
    type?: string;
    text: string;
    description?: string;
  };
  stats?: {
    home: ApiTeamStat[];
    away: ApiTeamStat[];
  };
  links?: Array<{
    text: string;
    href: string;
  }>;
  events?: Array<{
    minute: string;
    type: string;
    player: string;
    team_id?: string;
    kind: "goal" | "yellow-card" | "red-card" | "event";
  }>;
};

export type ApiTeamStat = {
  name: string;
  abbreviation?: string;
  label: string;
  value: string;
};

export type WorldCupPayload = {
  games: ApiGame[];
  teams: ApiTeam[];
  stadiums: ApiStadium[];
  groups: ApiGroupStanding[];
  source: "espn" | "worldcup26" | "fallback";
  updatedAt: string;
};

export const fallbackPayload: WorldCupPayload = {
  source: "fallback",
  updatedAt: new Date().toISOString(),
  teams: [
    {
      id: "1",
      name_en: "Mexico",
      fifa_code: "MEX",
      flag: "https://flagcdn.com/w80/mx.png",
      groups: "A",
    },
    {
      id: "2",
      name_en: "South Africa",
      fifa_code: "RSA",
      flag: "https://flagcdn.com/w80/za.png",
      groups: "A",
    },
    {
      id: "13",
      name_en: "United States",
      fifa_code: "USA",
      flag: "https://flagcdn.com/w80/us.png",
      groups: "D",
    },
    {
      id: "14",
      name_en: "Paraguay",
      fifa_code: "PAR",
      flag: "https://flagcdn.com/w80/py.png",
      groups: "D",
    },
    {
      id: "27",
      name_en: "Spain",
      fifa_code: "ESP",
      flag: "https://flagcdn.com/w80/es.png",
      groups: "H",
    },
    {
      id: "28",
      name_en: "Cape Verde",
      fifa_code: "CPV",
      flag: "https://flagcdn.com/w80/cv.png",
      groups: "H",
    },
  ],
  stadiums: [
    {
      id: "1",
      name_en: "Estadio Azteca",
      fifa_name: "Mexico City Stadium",
      city_en: "Mexico City",
      country_en: "Mexico",
      capacity: 83000,
    },
    {
      id: "3",
      name_en: "SoFi Stadium",
      fifa_name: "Los Angeles Stadium",
      city_en: "Inglewood, CA",
      country_en: "United States",
      capacity: 70000,
    },
    {
      id: "8",
      name_en: "Mercedes-Benz Stadium",
      fifa_name: "Atlanta Stadium",
      city_en: "Atlanta, GA",
      country_en: "United States",
      capacity: 75000,
    },
  ],
  groups: [
    {
      group: "A",
      teams: [
        { team_id: "1", mp: 1, w: 1, d: 0, l: 0, gf: 2, ga: 0, gd: 2, pts: 3 },
        { team_id: "2", mp: 1, w: 0, d: 0, l: 1, gf: 0, ga: 2, gd: -2, pts: 0 },
      ],
    },
    {
      group: "D",
      teams: [
        { team_id: "13", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
        { team_id: "14", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
      ],
    },
  ],
  games: [
    {
      id: "1",
      home_team_id: "1",
      away_team_id: "2",
      home_score: "2",
      away_score: "0",
      home_scorers: '{"S. Gimenez 18\'","E. Alvarez 64\'"}',
      away_scorers: "null",
      group: "A",
      matchday: "1",
      local_date: "06/11/2026 13:00",
      stadium_id: "1",
      finished: "TRUE",
      time_elapsed: "finished",
      type: "group",
      home_team_name_en: "Mexico",
      away_team_name_en: "South Africa",
    },
    {
      id: "4",
      home_team_id: "13",
      away_team_id: "14",
      home_score: "0",
      away_score: "0",
      home_scorers: "null",
      away_scorers: "null",
      group: "D",
      matchday: "1",
      local_date: "06/12/2026 18:00",
      stadium_id: "3",
      finished: "FALSE",
      time_elapsed: "notstarted",
      type: "group",
      home_team_name_en: "United States",
      away_team_name_en: "Paraguay",
    },
    {
      id: "25",
      home_team_id: "27",
      away_team_id: "28",
      home_score: "0",
      away_score: "0",
      home_scorers: "null",
      away_scorers: "null",
      group: "H",
      matchday: "1",
      local_date: "06/15/2026 12:00",
      stadium_id: "8",
      finished: "FALSE",
      time_elapsed: "42",
      type: "group",
      home_team_name_en: "Spain",
      away_team_name_en: "Cape Verde",
    },
  ],
};
