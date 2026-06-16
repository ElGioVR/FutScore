/* empty css                                 */
import { e as createComponent, k as renderHead, l as renderSlot, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute, n as renderComponent } from '../chunks/astro/server_OTItJcGc.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "FutScore Mundial 2026" } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Calendario, marcadores, grupos, fases, estadios y detalles en vivo del Mundial de Futbol 2026."><link rel="preconnect" href="https://site.api.espn.com"><link rel="preconnect" href="https://a.espncdn.com"><link rel="preconnect" href="https://worldcup26.ir"><link rel="icon" href="/public/copa.png"><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/futscore/src/layouts/BaseLayout.astro", void 0);

const $$Astro = createAstro();
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Icon;
  const { name, cls = "", size = 16 } = Astro2.props;
  return renderTemplate`${name === "search" && renderTemplate`${maybeRenderHead()}<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}${name === "chevron-left" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}${name === "chevron-right" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`}${name === "refresh" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a8.94 8.94 0 1 1-2.3-9.19"></path></svg>`}${name === "tv" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`}${name === "calendar" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`}${name === "plus" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`}${name === "soccer" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3l2.3 4.6L19 9l-3 3 .7 5L12 15l-4.7 2L8 12 5 9l4.7-1.4L12 3z"></path></svg>`}${name === "dot" && renderTemplate`<svg${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>`}${name === "world-cup" && renderTemplate`<img src="/copa.png" alt="World Cup"${addAttribute(cls, "class")}${addAttribute(size, "width")}${addAttribute(size, "height")}>`}${![
    "search",
    "chevron-left",
    "chevron-right",
    "refresh",
    "tv",
    "calendar",
    "plus",
    "soccer",
    "dot",
    "world-cup"
  ].includes(name) && renderTemplate`<span${addAttribute(cls, "class")}></span>`}`;
}, "C:/futscore/src/components/Icon.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {}, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<header class="topbar"> <div class="topbar-inner"> <a class="brand" href="/" aria-label="FutScore home"> ', ' <span>FutScore</span> </a> <label class="search-shell" aria-label="Buscar seleccion"> <span aria-hidden="true">', '</span> <input id="search" type="search" placeholder="Buscar equipo"> </label> <nav class="top-nav" aria-label="Principal"> <a href="#matches">Partidos</a> <a href="#groups">Grupos</a> <a href="#match-detail">Detalle</a> </nav> </div> </header> <main class="score-layout"> <aside class="left-rail"> <section class="panel league-panel"> <h2>FIFA World Cup</h2> <a class="league-link active" href="#matches"><span>WC</span> Partidos</a> <a class="league-link" href="#groups"><span>G</span> Grupos</a> <a class="league-link" href="#match-detail"><span>i</span> Detalle seleccionado</a> </section> </aside> <section class="center-feed"> <section class="panel date-card"> <div class="date-row"> <button type="button" aria-label="Dia anterior">', '</button> <strong>Mundial 2026</strong> <button type="button" aria-label="Dia siguiente">', '</button> </div> <div class="filter-row"> <button class="chip" data-view="live">En vivo</button> <button class="chip" data-view="today">Hoy</button> <button class="chip" data-view="all" data-active="true">Todos</button> <select id="group-filter" aria-label="Filtrar grupo"> <option value="all">Todos los grupos</option> </select> <button id="refresh" class="refresh-btn" type="button" aria-label="Actualizar">', '</button> </div> </section> <section id="matches" class="match-stack" aria-label="Partidos"></section> </section> <aside class="right-rail"> <section class="panel data-widget"> <div class="feed-copy"> <div class="feed-title-row"> <span class="feed-dot" aria-hidden="true">', '</span> <h2>Feed ESPN</h2> </div> <p id="data-status">Preparando datos...</p> </div> <div class="source-pill"> <small>Fuente</small> <span id="data-source">demo local</span> <time id="updated-at">--:--</time> </div> </section> <section class="panel detail-widget selected-match-widget"> <div id="match-detail"></div> </section> <section class="panel standings-shell side-standings" aria-label="Grupos del Mundial"> <div class="section-title"> <div> <h2>FIFA World Cup</h2> <p>Grupos calculados</p> </div> <span>A-L</span> </div> <div id="groups" class="standings-grid"></div> </section> </aside> </main> <script type="module">\n    import "/src/scripts/app.ts";\n  <\/script> '])), maybeRenderHead(), renderComponent($$result2, "Icon", $$Icon, { "name": "world-cup", "size": 42 }), renderComponent($$result2, "Icon", $$Icon, { "name": "search", "cls": "inline-icon", "size": 16 }), renderComponent($$result2, "Icon", $$Icon, { "name": "chevron-left", "cls": "inline-icon", "size": 16 }), renderComponent($$result2, "Icon", $$Icon, { "name": "chevron-right", "cls": "inline-icon", "size": 16 }), renderComponent($$result2, "Icon", $$Icon, { "name": "refresh", "cls": "inline-icon", "size": 16 }), renderComponent($$result2, "Icon", $$Icon, { "name": "dot", "cls": "feed-dot-icon", "size": 10 })) })}`;
}, "C:/futscore/src/pages/index.astro", void 0);

const $$file = "C:/futscore/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
