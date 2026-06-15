const WORLDCUP26_BASE_URL = "https://worldcup26.ir";
const ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const fallbackPayload = {
  source: "fallback",
  updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
  teams: [
    { id: "1", name_en: "Mexico", fifa_code: "MEX", flag: "https://flagcdn.com/w80/mx.png", groups: "A" },
    { id: "2", name_en: "South Africa", fifa_code: "RSA", flag: "https://flagcdn.com/w80/za.png", groups: "A" },
    { id: "13", name_en: "United States", fifa_code: "USA", flag: "https://flagcdn.com/w80/us.png", groups: "D" },
    { id: "14", name_en: "Paraguay", fifa_code: "PAR", flag: "https://flagcdn.com/w80/py.png", groups: "D" },
    { id: "27", name_en: "Spain", fifa_code: "ESP", flag: "https://flagcdn.com/w80/es.png", groups: "H" },
    { id: "28", name_en: "Cape Verde", fifa_code: "CPV", flag: "https://flagcdn.com/w80/cv.png", groups: "H" }
  ],
  stadiums: [
    { id: "1", name_en: "Estadio Azteca", fifa_name: "Mexico City Stadium", city_en: "Mexico City", country_en: "Mexico", capacity: 83e3 },
    { id: "3", name_en: "SoFi Stadium", fifa_name: "Los Angeles Stadium", city_en: "Inglewood, CA", country_en: "United States", capacity: 7e4 },
    { id: "8", name_en: "Mercedes-Benz Stadium", fifa_name: "Atlanta Stadium", city_en: "Atlanta, GA", country_en: "United States", capacity: 75e3 }
  ],
  groups: [
    { group: "A", teams: [{ team_id: "1", mp: 1, w: 1, d: 0, l: 0, gf: 2, ga: 0, gd: 2, pts: 3 }, { team_id: "2", mp: 1, w: 0, d: 0, l: 1, gf: 0, ga: 2, gd: -2, pts: 0 }] },
    { group: "D", teams: [{ team_id: "13", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }, { team_id: "14", mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }] }
  ],
  games: [
    {
      id: "1",
      home_team_id: "1",
      away_team_id: "2",
      home_score: "2",
      away_score: "0",
      home_scorers: `{"S. Gimenez 18'","E. Alvarez 64'"}`,
      away_scorers: "null",
      group: "A",
      matchday: "1",
      local_date: "06/11/2026 13:00",
      stadium_id: "1",
      finished: "TRUE",
      time_elapsed: "finished",
      type: "group",
      home_team_name_en: "Mexico",
      away_team_name_en: "South Africa"
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
      away_team_name_en: "Paraguay"
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
      away_team_name_en: "Cape Verde"
    }
  ]
};

export { ESPN_FIFA_WORLD_CUP_SCOREBOARD_URL as E, WORLDCUP26_BASE_URL as W, fallbackPayload as f };
