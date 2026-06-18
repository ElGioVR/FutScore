const R={source:"fallback",updatedAt:new Date().toISOString(),teams:[{id:"1",name_en:"Mexico",fifa_code:"MEX",flag:"https://flagcdn.com/w80/mx.png",groups:"A"},{id:"2",name_en:"South Africa",fifa_code:"RSA",flag:"https://flagcdn.com/w80/za.png",groups:"A"},{id:"13",name_en:"United States",fifa_code:"USA",flag:"https://flagcdn.com/w80/us.png",groups:"D"},{id:"14",name_en:"Paraguay",fifa_code:"PAR",flag:"https://flagcdn.com/w80/py.png",groups:"D"},{id:"27",name_en:"Spain",fifa_code:"ESP",flag:"https://flagcdn.com/w80/es.png",groups:"H"},{id:"28",name_en:"Cape Verde",fifa_code:"CPV",flag:"https://flagcdn.com/w80/cv.png",groups:"H"}],stadiums:[{id:"1",name_en:"Estadio Azteca",fifa_name:"Mexico City Stadium",city_en:"Mexico City",country_en:"Mexico",capacity:83e3},{id:"3",name_en:"SoFi Stadium",fifa_name:"Los Angeles Stadium",city_en:"Inglewood, CA",country_en:"United States",capacity:7e4},{id:"8",name_en:"Mercedes-Benz Stadium",fifa_name:"Atlanta Stadium",city_en:"Atlanta, GA",country_en:"United States",capacity:75e3}],groups:[{group:"A",teams:[{team_id:"1",mp:1,w:1,d:0,l:0,gf:2,ga:0,gd:2,pts:3},{team_id:"2",mp:1,w:0,d:0,l:1,gf:0,ga:2,gd:-2,pts:0}]},{group:"D",teams:[{team_id:"13",mp:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0},{team_id:"14",mp:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}]}],games:[{id:"1",home_team_id:"1",away_team_id:"2",home_score:"2",away_score:"0",home_scorers:`{"S. Gimenez 18'","E. Alvarez 64'"}`,away_scorers:"null",group:"A",matchday:"1",local_date:"06/11/2026 13:00",stadium_id:"1",finished:"TRUE",time_elapsed:"finished",type:"group",home_team_name_en:"Mexico",away_team_name_en:"South Africa"},{id:"4",home_team_id:"13",away_team_id:"14",home_score:"0",away_score:"0",home_scorers:"null",away_scorers:"null",group:"D",matchday:"1",local_date:"06/12/2026 18:00",stadium_id:"3",finished:"FALSE",time_elapsed:"notstarted",type:"group",home_team_name_en:"United States",away_team_name_en:"Paraguay"},{id:"25",home_team_id:"27",away_team_id:"28",home_score:"0",away_score:"0",home_scorers:"null",away_scorers:"null",group:"H",matchday:"1",local_date:"06/15/2026 12:00",stadium_id:"8",finished:"FALSE",time_elapsed:"42",type:"group",home_team_name_en:"Spain",away_team_name_en:"Cape Verde"}]};function Q(e,t="",n=16){const i=`width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;switch(e){case"search":return`<svg ${i} class="${t}"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;case"chevron-left":return`<svg ${i} class="${t}"><polyline points="15 18 9 12 15 6"></polyline></svg>`;case"chevron-right":return`<svg ${i} class="${t}"><polyline points="9 18 15 12 9 6"></polyline></svg>`;case"chevron-down":return`<svg ${i} class="${t}"><polyline points="6 9 12 15 18 9"></polyline></svg>`;case"refresh":return`<svg ${i} class="${t}"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a8.94 8.94 0 1 1-2.3-9.19"></path></svg>`;case"tv":return`<svg ${i} class="${t}"><rect x="2" y="6" width="20" height="14" rx="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`;case"calendar":return`<svg ${i} class="${t}"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;case"plus":return`<svg ${i} class="${t}"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;case"soccer":return`<svg ${i} class="${t}"><circle cx="12" cy="12" r="9"></circle><path d="M12 3l2.3 4.6L19 9l-3 3 .7 5L12 15l-4.7 2L8 12 5 9l4.7-1.4L12 3z"></path></svg>`;case"dot":return`<svg ${i} class="${t}"><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>`;default:return""}}const a={payload:R,activeView:"all",activeGroup:"all",visibleDayCount:3,selectedMatchId:null,query:"",activeDate:new Date,activeDetailTab:"facts",activeSection:"matches",mobileDetailOpen:!1,selectedByUser:!1},p=e=>document.querySelector(e),k=p("#matches"),ie=p("#bracket"),M=p("#knockout-bracket"),oe=Array.from(document.querySelectorAll("[data-groups-grid]")),A=p("#match-detail"),U=p("#data-status"),ce=p("#updated-at"),le=p("#data-source"),S=p("#group-filter"),q=p("#search"),H=document.querySelector(".score-layout"),j=document.querySelector(".date-card"),O=p("#filter-toggle"),de=document.querySelector(".date-row strong"),ue=Array.from(document.querySelectorAll(".date-row button")),X=Array.from(document.querySelectorAll("[data-section-link]")),$=p("#mobile-menu-toggle"),G=p("#mobile-menu"),L=document.querySelector("#ligamx-banner"),C=document.querySelector("#ligamx-banner-toggle"),Y={group:"Grupos",r32:"32avos",r16:"Octavos",qf:"Cuartos",sf:"Semifinal",third:"3er lugar",final:"Final"};async function pe(e,t=14e3){const n=new AbortController,i=window.setTimeout(()=>n.abort(),t);try{const r=await fetch(e,{signal:n.signal});if(!r.ok)throw new Error(`${e} returned ${r.status}`);return r.json()}finally{window.clearTimeout(i)}}async function J(){F("Conectando con ESPN...","loading");try{a.payload=await pe("/api/worldcup.json",26e3),a.selectedMatchId=E(),a.selectedByUser=!1,F(a.payload.source==="espn"?"Marcadores, eventos y TV en vivo":a.payload.source==="worldcup26"?"Datos alternos conectados":"Usando datos demo",a.payload.source==="fallback"?"fallback":"ready")}catch(e){console.warn(e),a.payload=R,a.selectedMatchId=E(),a.selectedByUser=!1,F("Usando datos demo","fallback")}m()}function F(e,t){U.textContent=e,U.dataset.mode=t}function o(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function v(e){try{const t=new URL(e,window.location.origin);return t.protocol==="http:"||t.protocol==="https:"?t.href:"#"}catch{return"#"}}function B(e){return a.payload.teams.find(t=>t.id===e)}function me(e){return a.payload.stadiums.find(t=>t.id===e)}function b(e,t){const n=t==="home"?e.home_team_name_en:e.away_team_name_en,i=t==="home"?e.home_team_label:e.away_team_label,r=B(t==="home"?e.home_team_id:e.away_team_id);return n||r?.name_en||i||"Por definir"}function _(e,t){const n=t==="home"?e.home_team_flag:e.away_team_flag,i=B(t==="home"?e.home_team_id:e.away_team_id);return n||i?.flag||""}function w(e){const t=String(e.time_elapsed??"").toLowerCase();return String(e.finished).toUpperCase()==="TRUE"||t==="finished"||t==="ft"?"finished":t!=="notstarted"&&t!==""&&t!=="null"?"live":"upcoming"}function u(e){if(/^\d{4}-\d{2}-\d{2}T/.test(e))return new Date(e);const[t,n="00:00"]=e.split(" "),[i,r,s]=t.split("/").map(Number),[c,l]=n.split(":").map(Number);return new Date(s,i-1,r,c,l)}function fe(e){return new Intl.DateTimeFormat("es-MX",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}).format(u(e.local_date))}function Z(e){return new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(u(e.local_date))}function ge(e){const t=u(e.local_date),n=String(t.getDate()).padStart(2,"0"),i=String(t.getMonth()+1).padStart(2,"0");return`${n}/${i}`}function ye(e){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(u(e.local_date))}function he(e){return D(e)?"Hoy":new Intl.DateTimeFormat("es-MX",{weekday:"short",day:"numeric",month:"short"}).format(u(e.local_date))}function D(e){const t=u(e.local_date),n=new Date;return t.getFullYear()===n.getFullYear()&&t.getMonth()===n.getMonth()&&t.getDate()===n.getDate()}function ee(e){const t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime();return u(e.local_date).getTime()>=n}function V(e){const t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0");return`${t}-${n}-${i}`}function ve(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function we(e,t){const n=new Date(e);return n.setDate(n.getDate()+t),n}function be(e){return e?new Intl.DateTimeFormat("es-MX",{weekday:"short",day:"numeric",month:"short"}).format(e):"Mundial 2026"}function z(e){return!e||e==="null"?[]:e.replace(/[{}"]/g,"").split(",").map(t=>t.trim()).filter(Boolean)}function te(e){return`${b(e,"home")} ${b(e,"away")} ${e.group} ${e.matchday} ${e.headline?.text??""}`.toLowerCase()}function _e(){const e=[...a.payload.games].sort(I).filter(n=>{const i=w(n);return!(a.activeView==="live"&&i!=="live"||a.activeView==="today"&&!D(n)||a.activeView==="all"&&!ee(n)||a.activeView==="date"&&a.activeDate&&!ve(u(n.local_date),a.activeDate)||a.activeGroup!=="all"&&n.group!==a.activeGroup||a.query&&!te(n).includes(a.query.toLowerCase()))});if(a.activeView!=="all")return e;const t=Se(e);return e.filter(n=>t.has(V(u(n.local_date))))}function I(e,t){if(a.activeView!=="today"&&a.activeView!=="all")return u(e.local_date).getTime()-u(t.local_date).getTime();const n=new Date().getTime(),i=u(e.local_date).getTime(),r=u(t.local_date).getTime(),s=(c,l)=>{const d=w(c);return d==="live"?0:d==="upcoming"&&l>=n?1:D(c)?2:3};return s(e,i)-s(t,r)||i-r}function $e(){return[...a.payload.games].sort(I).filter(e=>!(!ee(e)||a.activeGroup!=="all"&&e.group!==a.activeGroup||a.query&&!te(e).includes(a.query.toLowerCase())))}function Se(e){return new Set([...new Set(e.map(t=>V(u(t.local_date))))].slice(0,a.visibleDayCount))}function De(){return a.activeView!=="all"?!1:new Set($e().map(t=>V(u(t.local_date)))).size>a.visibleDayCount}function ke(e,t){const n=t.toLowerCase();return a.payload.teams.some(i=>i.groups!==e?!1:`${i.name_en} ${i.fifa_code??""}`.toLowerCase().includes(n))}function Ee(){if(a.activeGroup!=="all")return new Set([a.activeGroup]);if(!!a.query){const t=new Set;return a.query&&a.payload.teams.forEach(n=>{n.groups&&ke(n.groups,a.query)&&t.add(n.groups)}),t}if(a.selectedByUser){const t=a.payload.games.find(n=>n.id===a.selectedMatchId);if(t?.group)return new Set([t.group])}return null}function E(){const e=[...a.payload.games].filter(r=>D(r)).sort(I),t=e.find(r=>w(r)==="live"),n=e.find(r=>w(r)==="upcoming"),i=[...a.payload.games].filter(r=>w(r)==="upcoming").sort((r,s)=>u(r.local_date).getTime()-u(s.local_date).getTime())[0];return n?.id??t?.id??e[0]?.id??i?.id??a.payload.games[0]?.id??null}function xe(e){const t=w(e),n=t==="live"?String(e.time_elapsed):t==="finished"?"FT":Z(e);return`<span class="${t==="live"?"status-live":t==="finished"?"status-finished":"status-upcoming"} minute-pill">${o(n)}</span>`}function Te(e){return e?new Intl.NumberFormat("es-MX").format(e):"No disponible"}function Me(e){const t=e.stats?.home??[],n=e.stats?.away??[],i=[...new Set([...t,...n].map(r=>r.name))];return i.length?i.map(r=>{const s=t.find(l=>l.name===r),c=n.find(l=>l.name===r);return`
        <div class="stat-row">
          <strong>${o(s?.value??"-")}</strong>
          <span>${o(s?.label??c?.label??r)}</span>
          <strong>${o(c?.value??"-")}</strong>
        </div>
      `}).join(""):'<p class="empty-copy">ESPN no publico estadisticas para este partido.</p>'}function Ae(e,t){return`
    <div class="tv-panel">
      <div class="tv-card">
        <span>Transmision</span>
        <strong>${o(e.length?e.join(", "):"Sin transmision en el feed")}</strong>
      </div>
      <div class="tv-card">
        <span>ESPN</span>
        ${t.length?`
          <div class="espn-links compact">
            ${t.map(n=>`<a href="${v(n.href)}" target="_blank" rel="noreferrer">${o(n.text)}</a>`).join("")}
          </div>
        `:"<strong>Sin links disponibles</strong>"}
      </div>
    </div>
  `}function P(){return window.innerWidth<=1279}function Le(){const e=_e();if(!e.length){k.innerHTML='<div class="panel p-8 text-center text-sm text-zinc-400">No hay partidos para este filtro.</div>';return}const t=e.reduce((i,r)=>{const s=a.activeView==="today"||a.activeView==="all"?he(r):r.type==="group"?`Group ${r.group}`:Y[r.type]??r.type;return i[s]=i[s]??[],i[s].push(r),i},{});k.innerHTML=Object.entries(t).map(([i,r])=>`
      <section class="league-card">
        <div class="league-card-header">
          <span><span aria-hidden="true">WC</span> FIFA World Cup</span>
          <span>${r.length} partidos</span>
        </div>
        <span class="group-label">${o(i)}</span>
        ${r.map(s=>{const c=s.id===a.selectedMatchId,l=_(s,"home"),d=_(s,"away"),g=w(s);let f="";if(g==="upcoming"){const y=D(s)?"Hoy":ge(s);f=`<div class="score-cell"><small class="match-date">${o(y)}</small><div class="match-vs">vs</div></div>`}else{const y=`${Number(s.home_score)||0} - ${Number(s.away_score)||0}`;f=`<span class="score-cell">${o(y)}</span>`}return`
            <button class="match-card match-row ${c?"selected":""}" data-match-id="${s.id}">
              <span class="time-cell">${xe(s)}</span>
              <span class="team-cell">
                <span>${o(b(s,"home"))}</span>
                ${l?`<img src="${v(l)}" alt="">`:""}
              </span>
              ${f}
              <span class="team-cell away">
                ${d?`<img src="${v(d)}" alt="">`:""}
                <span>${o(b(s,"away"))}</span>
              </span>
              <span class="row-icons" aria-hidden="true">${s.broadcasts?.length?Q("tv","inline-icon",16):""}</span>
            </button>
          `}).join("")}
      </section>
    `).join("")+(De()?`
        <button class="load-more-matches" type="button">
          Ver mas partidos
        </button>
      `:""),document.querySelectorAll(".match-card").forEach(i=>{i.addEventListener("click",()=>{a.selectedMatchId=i.dataset.matchId??a.selectedMatchId,a.selectedByUser=!0,a.activeDetailTab="facts",P()&&(a.mobileDetailOpen=!0),m()})});const n=k.querySelector(".load-more-matches");n&&n.addEventListener("click",()=>{a.visibleDayCount+=3,m()})}function Ce(){const e=[...new Set([...a.payload.teams.map(s=>s.groups).filter(s=>!!s),...a.payload.games.map(s=>s.group).filter(s=>!!s&&s!=="Knockout"),...a.payload.groups.map(s=>String(s.group)).filter(Boolean)])].sort();S.innerHTML=`<option value="all">Todos los grupos</option>${e.map(s=>`<option value="${o(s)}">Group ${o(s)}</option>`).join("")}`,S.value=a.activeGroup;const t=Ee(),n=new Map;a.payload.groups.forEach(s=>{n.set(String(s.group),{group:String(s.group),teams:[...s.teams??[]]})}),e.forEach(s=>{const c=n.get(s)??{group:s,teams:[]},l=new Set((c.teams??[]).map(d=>d.team_id));a.payload.teams.filter(d=>d.groups===s&&!l.has(d.id)).forEach(d=>{c.teams=[...c.teams??[],{team_id:d.id,mp:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}]}),n.set(s,c)});const r=([...n.values()].length?[...n.values()]:e.map(s=>({group:s,teams:a.payload.teams.filter(c=>c.groups===s).map(c=>({team_id:c.id,mp:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}))}))).filter(s=>!t||t.has(String(s.group))).sort((s,c)=>String(s.group).localeCompare(String(c.group))).map(s=>{const c=[...s.teams??[]].sort((l,d)=>Number(d.pts)-Number(l.pts)||Number(d.gd)-Number(l.gd));return`
        <section class="standings-card">
          <div class="standings-card-head">
            <h3>Group ${o(s.group)}</h3>
            <span>${c.length} teams</span>
          </div>
          <div class="standings-table">
            <div class="standings-row standings-row-head">
              <span>#</span>
              <span></span>
              <span>PL</span>
              <span>GD</span>
              <span>PTS</span>
            </div>
            ${c.map((l,d)=>{const g=B(l.team_id),f=Number(l.gd),y=f>0?`+${f}`:String(f);return`
                <div class="standings-row">
                  <span class="rank-cell" data-rank="${d+1}">${d+1}</span>
                  <span class="team-name">
                    ${g?.flag?`<img src="${v(g.flag)}" alt="">`:""}
                    <span>${o(g?.name_en??l.team_id)}</span>
                  </span>
                  <span>${l.mp}</span>
                  <span>${y}</span>
                  <strong>${l.pts}</strong>
                </div>
              `}).join("")}
          </div>
        </section>
      `}).join("")||'<p class="empty-copy">No hay grupos para este filtro.</p>';oe.forEach(s=>{s.innerHTML=r})}function Fe(){const e=["r16","qf","sf","third","final"],t=[...a.payload.games].filter(r=>e.includes(r.type)).sort((r,s)=>u(r.local_date).getTime()-u(s.local_date).getTime());if(!t.length){M.innerHTML=`
      <div class="bracket-empty">
        <strong>Llave pendiente</strong>
        <span>ESPN todavia no publico los cruces de eliminacion directa en el feed.</span>
      </div>
    `;return}const n={r16:t.filter(r=>r.type==="r16"),qf:t.filter(r=>r.type==="qf"),sf:t.filter(r=>r.type==="sf"),third:t.filter(r=>r.type==="third"),final:t.filter(r=>r.type==="final")},i=[{key:"r16-1",game:n.r16[0],x:14,y:1},{key:"r16-2",game:n.r16[1],x:38.5,y:1},{key:"r16-3",game:n.r16[2],x:63,y:1},{key:"r16-4",game:n.r16[3],x:87.5,y:1},{key:"qf-1",game:n.qf[0],x:26.25,y:16.5},{key:"qf-2",game:n.qf[1],x:75.25,y:16.5},{key:"sf-1",game:n.sf[0],x:50,y:33.5},{key:"third",game:n.third[0],x:18,y:46.5,label:"BRONZE-FINAL"},{key:"final",game:n.final[0],x:50,y:46.5,label:"FINAL"},{key:"sf-2",game:n.sf[1],x:50,y:59},{key:"qf-3",game:n.qf[2],x:26.25,y:74.5},{key:"qf-4",game:n.qf[3],x:75.25,y:74.5},{key:"r16-5",game:n.r16[4],x:14,y:87.5},{key:"r16-6",game:n.r16[5],x:38.5,y:87.5},{key:"r16-7",game:n.r16[6],x:63,y:87.5},{key:"r16-8",game:n.r16[7],x:87.5,y:87.5}];M.innerHTML=`
    <div class="bracket-tree">
      ${i.map(r=>qe(r.game,r.x,r.y,r.key,r.label)).join("")}
      <div class="champion-node" style="left: 82%; top: 46%;">
        <div class="trophy-shape" aria-hidden="true">
          <span></span>
        </div>
        <strong>Champion</strong>
      </div>
    </div>
  `,M.querySelectorAll(".bracket-game").forEach(r=>{r.addEventListener("click",()=>{a.selectedMatchId=r.dataset.matchId??a.selectedMatchId,a.selectedByUser=!0,a.activeDetailTab="facts",P()&&(a.mobileDetailOpen=!0),m()})})}function qe(e,t,n,i,r){if(!e)return`
      <div class="bracket-game bracket-placeholder" data-slot="${o(i)}" style="left: ${t}%; top: ${n}%;">
        <span class="bracket-team"><span class="bracket-seed"></span><strong>Por definir</strong><b></b></span>
        <span class="bracket-team"><span class="bracket-seed"></span><strong>Por definir</strong><b></b></span>
        <small>${o(r??"Por definir")}</small>
      </div>
    `;const s=e.id===a.selectedMatchId,c=w(e),l=_(e,"home"),d=_(e,"away"),g=W(e,"home",i),f=W(e,"away",i),y=c==="upcoming"?"":String(Number(e.home_score)||0),T=c==="upcoming"?"":String(Number(e.away_score)||0);return`
    <button class="bracket-game ${s?"selected":""}" data-match-id="${e.id}" data-slot="${o(i)}" style="left: ${t}%; top: ${n}%;" type="button">
      <span class="bracket-team">
        ${l?`<img src="${v(l)}" alt="">`:'<span class="bracket-seed"></span>'}
        <strong>${o(g)}</strong>
        <b>${o(y)}</b>
      </span>
      <span class="bracket-team">
        ${d?`<img src="${v(d)}" alt="">`:'<span class="bracket-seed"></span>'}
        <strong>${o(f)}</strong>
        <b>${o(T)}</b>
      </span>
      <small>${o(ye(e))}</small>
      ${r?`<em>${o(r)}</em>`:""}
    </button>
  `}function W(e,t,n){const i=b(e,t);if(!/winner|place|round|quarterfinal|semifinal|final/i.test(i))return i;const s={"r16-1":["1EA","1C"],"r16-2":["2AB","1FC"],"r16-3":["2K","1HJ"],"r16-4":["1DB","1GA"],"r16-5":["1CF","2EI"],"r16-6":["1AC","1LE"],"r16-7":["1JH","2DG"],"r16-8":["1BE","1KD"],"qf-1":["EF1","EF2"],"qf-2":["EF5","EF6"],"qf-3":["EF3","EF4"],"qf-4":["EF7","EF8"],"sf-1":["WQ1","WQ2"],"sf-2":["WQ3","WQ4"],final:["WS1","WS2"],third:["LS1","LS2"]}[n];return s?s[t==="home"?0:1]:i}function ae(){const e=a.payload.games.find(h=>h.id===a.selectedMatchId)??a.payload.games[0];if(!e){A.innerHTML='<p class="p-4 text-sm text-zinc-500">Selecciona un partido.</p>';return}const t=me(e.stadium_id),n=_(e,"home"),i=_(e,"away"),r=w(e),s=z(e.home_scorers),c=z(e.away_scorers),l=e.broadcasts??[],d=e.links??[],g=e.events??[],f=r==="finished"?"Full time":r==="live"?String(e.time_elapsed):Z(e),y=e.headline?.text||e.headline?.description,T=`
    ${y?`
      <div class="headline-box">
        <span>${o(e.headline?.type??"ESPN")}</span>
        <strong>${o(y)}</strong>
      </div>
    `:""}

    <div class="selected-facts">
      <div>
        <span>Stage</span>
        <strong>${o(Y[e.type]??e.type)}</strong>
      </div>
      <div>
        <span>Goals</span>
        <strong>${o(s.length+c.length?[...s,...c].join(", "):"Sin goles")}</strong>
      </div>
      <div>
        <span>TV</span>
        <strong>${o(l.length?l.join(", "):"Sin transmision en el feed")}</strong>
      </div>
      <div>
        <span>Asistencia</span>
        <strong>${o(Te(e.attendance))}</strong>
      </div>
    </div>

    <div class="stat-list">
      <h3>Estadisticas ESPN</h3>
      ${Me(e)}
    </div>
  `,ne=`
    <div class="event-list">
      <h3>Eventos ESPN</h3>
      ${g.length?g.map(h=>`
        <div class="event-row" data-kind="${h.kind}">
          <span>${o(h.minute||"--")}</span>
          <strong>${o(h.type)}</strong>
          <p>${o(h.player)}</p>
        </div>
      `).join(""):'<p class="empty-copy">Sin eventos disponibles para este partido.</p>'}
    </div>
  `,se=Ae(l,d),re=a.activeDetailTab==="events"?ne:a.activeDetailTab==="tv"?se:T;A.innerHTML=`
    <article class="selected-match-card">
      <div class="selected-match-top">
        <button type="button" class="detail-close" aria-label="Volver al listado">
          ${Q("chevron-left","text-white",18)}
        </button>
        <div>
          <p>Partido seleccionado</p>
          <h2>${o(e.matchday)}</h2>
        </div>
        ${d[0]?`<a href="${v(d[0].href)}" target="_blank" rel="noreferrer">ESPN</a>`:""}
      </div>

      <div class="selected-match-meta">
        <span>${o(fe(e))}</span>
        <span>${o(t?.fifa_name??t?.name_en??"Por confirmar")}</span>
      </div>

      <div class="selected-score-block">
        <div class="selected-team">
          ${n?`<img src="${v(n)}" alt="">`:""}
          <strong>${o(b(e,"home"))}</strong>
          <span>${o(e.group?`Group ${e.group}`:"Home")}</span>
        </div>

        <div class="selected-score" data-status="${r}">
          <strong>${Number(e.home_score)||0} - ${Number(e.away_score)||0}</strong>
          <span class="${r==="live"?"selected-live-time":""}">${o(e.status_detail??f)}</span>
        </div>

        <div class="selected-team">
          ${i?`<img src="${v(i)}" alt="">`:""}
          <strong>${o(b(e,"away"))}</strong>
          <span>${o(e.group?`Group ${e.group}`:"Away")}</span>
        </div>
      </div>

      <div class="selected-tabs" role="tablist" aria-label="Detalle del partido">
        <button type="button" data-detail-tab="facts" data-active="${a.activeDetailTab==="facts"}" role="tab" aria-selected="${a.activeDetailTab==="facts"}">Facts</button>
        <button type="button" data-detail-tab="events" data-active="${a.activeDetailTab==="events"}" role="tab" aria-selected="${a.activeDetailTab==="events"}">Events</button>
        <button type="button" data-detail-tab="tv" data-active="${a.activeDetailTab==="tv"}" role="tab" aria-selected="${a.activeDetailTab==="tv"}">TV</button>
      </div>

      <div class="detail-tab-panel" role="tabpanel">
        ${re}
      </div>
    </article>
  `,document.querySelectorAll("[data-detail-tab]").forEach(h=>{h.addEventListener("click",()=>{a.activeDetailTab=h.dataset.detailTab??"facts",ae()})});const N=A.querySelector(".detail-close");N&&N.addEventListener("click",()=>{a.mobileDetailOpen=!1,m()}),H&&(H.dataset.mobileDetailOpen=String(P()&&a.mobileDetailOpen))}function Ge(){ce.textContent=new Intl.DateTimeFormat("es-MX",{hour:"numeric",minute:"2-digit",second:"2-digit"}).format(new Date(a.payload.updatedAt));const e={espn:"ESPN publico",worldcup26:"worldcup26.ir",fallback:"demo local"};le.textContent=e[a.payload.source]}function Be(){de.textContent=a.activeView==="today"?"Hoy":a.activeView==="all"?"Todos":be(a.activeDate)}function Ve(){k.hidden=a.activeSection!=="matches",ie.hidden=a.activeSection!=="bracket",X.forEach(e=>{const t=e.dataset.sectionLink===a.activeSection;e.classList.toggle("active",t),e.setAttribute("aria-current",t?"page":"false")})}function x(e){!G||!$||(G.hidden=!e,$.setAttribute("aria-expanded",String(e)),$.setAttribute("aria-label",e?"Cerrar menu":"Abrir menu"))}function Ie(){a.activeSection="matches",a.activeView="all",a.activeGroup="all",a.visibleDayCount=3,a.selectedMatchId=E(),a.query="",a.activeDate=null,a.activeDetailTab="facts",a.mobileDetailOpen=!1,a.selectedByUser=!1,S.value="all",q.value=""}function m(){Ge(),Be(),Le(),Ce(),Fe(),Ve(),ae()}X.forEach(e=>{e.addEventListener("click",t=>{t.preventDefault(),a.activeSection=e.dataset.sectionLink??"matches",window.history.replaceState(null,"",e.getAttribute("href")??"#matches"),x(!1),m()})});$.addEventListener("click",()=>{x($.getAttribute("aria-expanded")!=="true")});G.querySelectorAll("a").forEach(e=>{e.addEventListener("click",()=>{x(!1)})});C?.addEventListener("click",()=>{if(!L)return;const e=L.dataset.minimized==="true";L.dataset.minimized=String(!e),C.setAttribute("aria-expanded",String(e)),C.textContent=e?"Minimizar":"Mostrar"});document.querySelectorAll("[data-view]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.view??"all";t==="all"?Ie():(a.activeSection="matches",a.activeView=t,a.visibleDayCount=3,a.activeDate=a.activeView==="today"?new Date:null),document.querySelectorAll("[data-view]").forEach(n=>{n.dataset.active=String(n===e)}),m()})});ue.forEach((e,t)=>{e.addEventListener("click",()=>{a.activeSection="matches",a.visibleDayCount=3;const n=t===0?-1:1;a.activeDate=we(a.activeDate??new Date,n),a.activeView="date",document.querySelectorAll("[data-view]").forEach(i=>{i.dataset.active="false"}),m()})});S.addEventListener("change",()=>{a.activeSection="matches",a.visibleDayCount=3,a.activeGroup=S.value,a.selectedByUser=!1,m()});q.addEventListener("input",()=>{a.activeSection="matches",a.visibleDayCount=3,a.query=q.value.trim(),a.selectedByUser=!1,m()});O.addEventListener("click",()=>{const e=j.dataset.filtersOpen==="true";j.dataset.filtersOpen=String(!e),O.setAttribute("aria-expanded",String(!e))});p("#refresh").addEventListener("click",J);let K=window.innerWidth;window.addEventListener("resize",()=>{const e=window.innerWidth,t=K<=1279,n=e>1279;t&&n&&(a.mobileDetailOpen=!1,x(!1),m()),K=e});a.selectedMatchId=E();m();J();
