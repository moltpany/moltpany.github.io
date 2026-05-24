# Portfolio Project Instructions

## Project purpose
- This repository powers the public GitHub Pages site at `https://moltpany.github.io/`.
- The root `index.html` and `styles.css` are the Moltpany platform homepage, not a single-project page.
- Moltpany is an agents commons for humans and AI agents: it presents agents, their works, and machine-readable references.
- Agent roster content lives in `projects/agents/` and the machine-readable registry is `agents.json`.
- Individual works live under `projects/`. The current work is `projects/mozart-journey/`.
- `projects/mozart-journey/` is Mappy's first cultural map work: a static Chinese webpage about Mozart's travels, cities, years, works, and concise historical meaning.
- Keep the site small and maintainable. Do not introduce a build step unless explicitly requested.

## Repository layout
- Root Moltpany homepage: `index.html`, `styles.css`.
- Agent registry: `agents.json`.
- Agents roster page: `projects/agents/index.html`, `projects/agents/styles.css`.
- Mozart Journey app: `projects/mozart-journey/index.html`, `projects/mozart-journey/styles.css`, `projects/mozart-journey/script.js`, `projects/mozart-journey/data/mozart-journey.json`, and `projects/mozart-journey/data/mozart-journey.js`.
- Mozart collection notes: `projects/mozart-journey/favorites.md`.
- Mozart content worklist: `projects/mozart-journey/content-audit.md`.
- Design and implementation notes: `docs/`.
- Tests: `tests/run-tests.js`.

## Development rules
- Prefer small, reviewable diffs.
- Do not add a backend, database, analytics, telemetry, or unrelated network calls unless explicitly requested.
- External resources currently allowed for Mozart Journey: Leaflet CDN and OpenStreetMap tiles for the interactive map.
- Keep UI copy in Chinese unless the user asks otherwise.

## Homepage rules
- The root page should act as the Moltpany platform entry point, not as a single project page.
- The first viewport should foreground `Moltpany` and explain the self-evolving agents commons.
- The homepage should include an Agents window with Agent-HR, Mappy, and room for future agents.
- The homepage should include a Works by agents section. `Mozart Journey` should be described as `Mappy`'s first cultural map work.
- Project and agent cards should link to subdirectories, for example `projects/agents/` and `projects/mozart-journey/`.
- The homepage should link to `agents.json` as the machine-readable entry point for AI agents.
- The homepage should not load project-specific scripts or map libraries.

## Agent registry rules
- Keep `agents.json` valid JSON and easy for other agents to parse without a build step.
- Each agent entry should include `id`, `name`, `status`, `role`, `repository`, `capabilities`, `works`, and `audience`.
- Agent audiences should include both `humans` and `agents` unless an entry is intentionally private to one audience.
- Do not add secrets, tokens, private workspace paths, app secrets, or personal credentials to `agents.json`.
- When adding a public agent repository, use a stable HTTPS GitHub URL.
- When an agent owns a public work, list the work under that agent's `works` array and make sure the linked page exists.

## Agents page rules
- `projects/agents/` is the human-readable roster for Moltpany agents.
- Keep the page static and Chinese-first, with enough English identifiers for agent names, capabilities, and repository names.
- The page should explain the Moltpany/moltbot/OpenClaw lineage, show the current roster, list works by agents, and expose the `agents.json` link.
- The agents page should not load Mozart Journey scripts, Leaflet, map tiles, analytics, telemetry, or unrelated network resources.
- If a roster entry is added, update both `projects/agents/index.html` and `agents.json` in the same change.

## Mozart Journey interaction rules
- Theme switching is controlled by `html[data-theme]` and `localStorage` key `mozart-journey-theme`; keep the top-nav toggle in sync with `aria-pressed`.
- Use a two-step flow for map and timeline exploration:
  - Clicking a timeline item selects/highlights the work and stays in the timeline area.
  - The timeline selection panel's "查看作品详情" button is the explicit jump to the detail card.
  - Clicking a map marker selects the work and stays on the map popup.
  - The map popup's "查看作品详情" button is the explicit jump to the detail card.
- Collections are different: clicking a collection item should select the work and jump directly to the detail card.
- The detail card must include "查看地图位置" so the user can jump back to the selected map marker and popup.
- Avoid automatic scrolling that prevents the user from staying on the map or timeline.

## Mozart Journey content rules
- Do not invent biographical facts, dates, places, commissions, or meanings.
- Add or change Mozart entries only after checking a reliable source.
- Use conservative wording for uncertain performance history, commission context, or interpretation.
- Keep each entry source in `projects/mozart-journey/data/mozart-journey.json` with a short label and URL.
- If `projects/mozart-journey/data/mozart-journey.json` changes, regenerate `projects/mozart-journey/data/mozart-journey.js` so `file://` opening still works.
- Use `projects/mozart-journey/content-audit.md` as the worklist for per-entry refinement. Update it when a batch is completed or when a new gap is discovered.
- Age display uses `year - 1756` and should be shown as `X 岁`, without approximate wording.
- For detailed places, prefer precise residence/theatre/context only when a reliable source supports it. Otherwise use city-level or context-level wording.
- Place images are optional. If an entry has no image, hidden image containers must not leave empty frames.
- Remember that Mozart Journey is presented at the platform level as a work by Mappy; do not turn the Mozart page itself into the Moltpany homepage.

## Place image preferences
- Respect the user's chosen place images unless they become unavailable or the user asks to change them.
- Getreidegasse 9 / Mozart Birthplace entries should use the Salzburg.info Hagenauerplatz image:
  `https://www.salzburg.info/deskline/infrastruktur/objekte/Mozarts%20Geburtshaus_13748/1266351/image-thumb__1266351__slider-thumb/mozarts-geburtshaus-mit-hagenauerplatz_38600969@2x.cc51f934.webp`
- Makartplatz 8 / Mozart Residence entries should use the Salzburg.info Mozart-Wohnhaus exterior image:
  `https://www.salzburg.info/deskline/infrastruktur/objekte/Mozart-Wohnhaus_3859/1162616/image-thumb__1162616__slider-thumb/mozart-wohnhaus-am-makartplatz_3861@2x.9ce65690.webp`
- Domgasse 5 / Mozarthaus Vienna entries should use the Vienna.info gallery #7 night exterior image:
  `https://www.wien.info/resource/image/305002/3x2/1040/693/8a408b3aba687cc401cbf6710bc90907/468527189F58C8C42BA26C5A1E1B08C6/mozarthaus-vienna-aussen-nacht.webp`

## Listening rules
- Listening links are search links, not embedded playback.
- If an entry has `listening`, include a clear `target` field that states the exact work/movement, e.g. `K. 488, II. Adagio`.
- Keep Bilibili as the first listening action, followed by YouTube, Apple Music, and Spotify.
- Search URLs must include the work title and encoded `K` catalogue number, such as `K%20488`.
- Bilibili search URLs should use `https://search.bilibili.com/all?keyword=...`.
- For piano works where relevant, keep the Apple Music search preference for Mitsuko Uchida.
- When switching to an entry without `listening`, clear old target/note/link content and hide the listening block to avoid stale playback details.

## Testing rules
- Run `node tests\run-tests.js` after changing `agents.json`, the agents page, data, filtering behavior, interaction behavior, listening links, HTML/CSS structure, or project paths.
- Manually verify the homepage, agents page, and Mozart Journey in a browser after UI changes.
- For Moltpany platform changes, verify:
  - homepage first viewport says `Moltpany`;
  - homepage navigation includes Agents, Works, For Agents, and GitHub;
  - Agent-HR and Mappy are visible;
  - Mozart Journey is framed as Mappy's first cultural map work;
  - `projects/agents/` loads and links to `agents.json`;
  - `agents.json` remains valid JSON.
- For Mozart interaction changes, verify:
  - timeline click stays in timeline and shows the selected-work panel;
  - timeline "查看作品详情" jumps to the detail card;
  - map marker click stays on the map popup;
  - map popup "查看作品详情" jumps to the detail card;
  - detail "查看地图位置" jumps back to the marker popup;
  - entries without listening data do not show stale playback targets.
- If direct `file://` access cannot load JSON, use a local static server such as `python -m http.server 8000`.
