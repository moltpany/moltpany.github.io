const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const portfolioIndexPath = path.join(root, "index.html");
const portfolioStylesPath = path.join(root, "styles.css");
const journeyRoot = path.join(root, "projects", "mozart-journey");
const journeyIndexPath = path.join(journeyRoot, "index.html");
const journeyStylesPath = path.join(journeyRoot, "styles.css");
const dataPath = path.join(journeyRoot, "data", "mozart-journey.json");
const scriptPath = path.join(journeyRoot, "script.js");
const favoritesPath = path.join(journeyRoot, "favorites.md");
const auditPath = path.join(journeyRoot, "content-audit.md");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadJourneyApi(overrides = {}) {
  const code = fs.readFileSync(scriptPath, "utf8");
  const sandbox = {
    console,
    window: overrides.window || {},
    document: {
      addEventListener() {},
      getElementById() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      createElement() {
        return {
          className: "",
          dataset: {},
          addEventListener() {},
          appendChild() {},
          setAttribute() {},
          innerHTML: "",
          textContent: "",
        };
      },
    },
    fetch: overrides.fetch || (async () => ({ ok: true, json: async () => [] })),
    L: {
      map: () => ({
        setView() {},
        removeLayer() {},
      }),
      tileLayer: () => ({ addTo() {} }),
      marker: () => ({
        addTo() {
          return this;
        },
        bindPopup() {
          return this;
        },
        openPopup() {},
      }),
      latLngBounds: () => ({}),
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "script.js" });
  return sandbox.window.MozartJourney;
}

function testDataShape() {
  const entries = readJson(dataPath);
  assert(Array.isArray(entries), "journey data must be an array");
  assert(entries.length >= 20, "journey data must include the original timeline plus favorite works");

  const ids = new Set();
  for (const entry of entries) {
    assert(entry.id && !ids.has(entry.id), `entry id must be present and unique: ${entry.id}`);
    ids.add(entry.id);
    assert(Number.isInteger(entry.year), `${entry.id} must have an integer year`);
    assert(entry.city && entry.country, `${entry.id} must include city and country`);
    assert(typeof entry.lat === "number" && typeof entry.lng === "number", `${entry.id} must include numeric coordinates`);
    assert(entry.place && typeof entry.place === "object", `${entry.id} must include a detailed place object`);
    assert(entry.place.name && entry.place.address, `${entry.id} must include a detailed place name and address`);
    assert(entry.place.kind && entry.place.certainty, `${entry.id} must include place kind and certainty`);
    assert(entry.place.note, `${entry.id} must include a place note explaining what is known`);
    assert(typeof entry.place.lat === "number" && typeof entry.place.lng === "number", `${entry.id} must include detailed place coordinates`);
    assert(entry.place.source && entry.place.source.label && entry.place.source.url, `${entry.id} must include a detailed place source`);
    assert(entry.work && entry.catalogue && entry.genre, `${entry.id} must include work metadata`);
    assert(entry.context && entry.meaning, `${entry.id} must include context and meaning`);
    assert(entry.source && entry.source.label && entry.source.url, `${entry.id} must include a compact source reference`);
    assert(entry.source.summary, `${entry.id} must include a source summary`);
    if (entry.listening) {
      assert(entry.listening.appleMusicSearch || entry.listening.appleMusic || entry.listening.youtubeSearch, `${entry.id} listening must include at least one playable link`);
    }
  }
}

function testPortfolioHome() {
  const html = fs.readFileSync(portfolioIndexPath, "utf8");
  const styles = fs.readFileSync(portfolioStylesPath, "utf8");
  assert(html.includes("moltpany"), "portfolio home should identify the site owner");
  assert(html.includes("Mozart Journey"), "portfolio home should feature Mozart Journey");
  assert(html.includes("projects/mozart-journey/"), "portfolio home should link to the Mozart Journey subproject");
  assert(!html.includes("leaflet.js"), "portfolio home should not load the Mozart map application");
  assert(styles.includes(".project-card"), "portfolio home should style project cards");
}

function testFilters() {
  const api = loadJourneyApi();
  assert(api && typeof api.filterEntries === "function", "script must expose window.MozartJourney.filterEntries");
  assert(typeof api.getFilterOptions === "function", "script must expose window.MozartJourney.getFilterOptions");
  assert(typeof api.getEntryCoordinates === "function", "script must expose window.MozartJourney.getEntryCoordinates");
  assert(typeof api.getAge === "function", "script must expose window.MozartJourney.getAge");
  assert(typeof api.getCollectionGroups === "function", "script must expose window.MozartJourney.getCollectionGroups");
  assert(typeof api.getEntryCollections === "function", "script must expose window.MozartJourney.getEntryCollections");
  assert(typeof api.formatAge === "function", "script must expose window.MozartJourney.formatAge");
  assert(typeof api.applyTheme === "function", "script must expose window.MozartJourney.applyTheme");
  assert(typeof api.getInitialTheme === "function", "script must expose window.MozartJourney.getInitialTheme");
  assert(typeof api.toggleTheme === "function", "script must expose window.MozartJourney.toggleTheme");

  const entries = readJson(dataPath);
  const vienna = api.filterEntries(entries, { city: "Vienna", genre: "all", period: "all" });
  assert(vienna.length > 0, "city filter should return Vienna entries");
  assert(vienna.every((entry) => entry.city === "Vienna"), "city filter should only return matching city");

  const operas = api.filterEntries(entries, { city: "all", genre: "Opera", period: "all" });
  assert(operas.length > 0, "genre filter should return opera entries");
  assert(operas.every((entry) => entry.genre === "Opera"), "genre filter should only return matching genre");

  const early = api.filterEntries(entries, { city: "all", genre: "all", period: "1756-1772" });
  assert(early.length > 0, "period filter should return early entries");
  assert(early.every((entry) => entry.year >= 1756 && entry.year <= 1772), "period filter should honor inclusive bounds");

  const london = entries.find((entry) => entry.id === "london-1764-symphony-1");
  const coords = api.getEntryCoordinates(london);
  assert(coords[0] === london.place.lat && coords[1] === london.place.lng, "map coordinates should prefer detailed place coordinates");
  assert(api.getAge(1786) === 30, "Mozart's age display year in 1786 should be 30");
  assert(api.formatAge(1786) === "30 岁", "age display should not include approximate wording");
  assert(!api.formatAge(1786).includes("约"), "age display should not include 约");

  const groups = api.getCollectionGroups(entries);
  assert(groups.length >= 3, "collection groups should include user favorite categories");
  const groupIds = groups.map((group) => group.id);
  assert(groupIds.includes("salzburg-trilogy"), "collections should include Salzburg trilogy");
  assert(groupIds.includes("pressure-relief"), "collections should include pressure relief listening");
  assert(groupIds.includes("job-search"), "collections should include job-search works");
  assert(groupIds.includes("favorite-playing"), "collections should include favorite-playing works");
  assert(groupIds.includes("heard-live"), "collections should include live-heard works");
  assert(groupIds.includes("personal-favorites"), "collections should include personal favorites");
  assert(groupIds.includes("favorite-album"), "collections should include favorite album works");
  assert(groupIds.includes("coffee-playlist"), "collections should include the coffee playlist");
  assert(groupIds.includes("sleep-playlist"), "collections should include sleep playlist works");
  const k466 = entries.find((entry) => entry.id === "vienna-1785-piano-concerto-20");
  const k466Collections = api.getEntryCollections(k466);
  assert(k466Collections.some((collection) => collection.id === "pressure-relief"), "detail helpers should expose collection labels for a favorite work");
  const k467 = entries.find((entry) => entry.id === "vienna-1785-piano-concerto-21");
  assert(api.getEntryCollections(k467).some((collection) => collection.id === "heard-live"), "K. 467 should be marked as heard live");
  assert(api.getEntryCollections(k467).some((collection) => collection.id === "sleep-playlist"), "K. 467 should be marked in the sleep playlist");
  const k488 = entries.find((entry) => entry.id === "vienna-1786-piano-concerto-23");
  assert(api.getEntryCollections(k488).some((collection) => collection.id === "personal-favorites"), "K. 488 should be marked as a personal favorite");
  const k525 = entries.find((entry) => entry.id === "vienna-1787-night-music");
  assert(k525, "K. 525 should be in the journey data");
  assert(api.getEntryCollections(k525).some((collection) => collection.id === "personal-favorites"), "K. 525 should be marked as a personal favorite");
  const k310 = entries.find((entry) => entry.id === "paris-1778-piano-sonata-8");
  assert(api.getEntryCollections(k310).some((collection) => collection.id === "favorite-album"), "K. 310 should be marked in the favorite album collection");
  const k216 = entries.find((entry) => entry.id === "salzburg-1775-violin-concerto-3");
  assert(api.getEntryCollections(k216).some((collection) => collection.id === "coffee-playlist"), "K. 216 should be marked in the coffee playlist");
  const coffeeGroup = groups.find((group) => group.id === "coffee-playlist");
  assert(coffeeGroup, "coffee playlist collection should be rendered");
  const coffeeCatalogues = coffeeGroup.entries.map((entry) => entry.catalogue).sort();
  for (const catalogue of ["K. 136", "K. 216", "K. 331", "K. 492", "K. 551"]) {
    assert(coffeeCatalogues.includes(catalogue), `coffee playlist should include ${catalogue}`);
  }
  assert(coffeeCatalogues.length >= 5, "coffee playlist should show all saved coffee works, including overlaps");
  const k545 = entries.find((entry) => entry.id === "vienna-1788-piano-sonata-16");
  assert(k545, "K. 545 should be in the journey data");
  assert(api.getEntryCollections(k545).some((collection) => collection.id === "favorite-playing"), "K. 545 should be marked as a favorite to play");
  assert(api.getEntryCollections(k545).some((collection) => collection.id === "sleep-playlist"), "K. 545 should be marked in the sleep playlist");
  const k330 = entries.find((entry) => entry.id === "salzburg-vienna-1783-piano-sonata-10");
  assert(k330, "K. 330 should be in the journey data");
  assert(api.getEntryCollections(k330).some((collection) => collection.id === "favorite-playing"), "K. 330 should be marked as a favorite to play");
}

function testListeningLinks() {
  const entries = readJson(dataPath);
  const ids = [
    "vienna-1785-piano-concerto-21",
    "vienna-1786-piano-concerto-23",
    "vienna-1791-clarinet-concerto",
    "salzburg-1775-violin-concerto-3",
    "salzburg-1775-violin-concerto-5",
    "paris-1778-flute-harp-concerto",
    "vienna-1788-piano-sonata-16",
    "salzburg-vienna-1783-piano-sonata-10",
    "salzburg-1772-divertimento-1",
    "salzburg-vienna-1783-piano-sonata-11",
    "vienna-1788-symphony-41",
    "vienna-1787-night-music",
  ];
  for (const id of ids) {
    const entry = entries.find((item) => item.id === id);
    assert(entry && entry.listening, `${id} should include listening links`);
    assert(entry.listening.target, `${id} should state the exact listening target`);
    assert(entry.listening.bilibiliSearch, `${id} should include Bilibili search`);
    assert(entry.listening.appleMusicSearch, `${id} should include Apple Music search`);
    assert(!entry.listening.bilibiliSearch.includes("+"), `${id} Bilibili search should avoid plus-encoded terms`);
    assert(!entry.listening.appleMusicSearch.includes("+"), `${id} Apple Music search should avoid plus-encoded terms`);
    assert(entry.listening.youtubeSearch, `${id} should include YouTube search fallback`);
  }
  for (const entry of entries.filter((item) => item.listening)) {
    const catalogueNumber = entry.catalogue.match(/\d+/)[0];
    const encodedK = `K%20${catalogueNumber}`;
    assert(entry.listening.target.includes(entry.catalogue), `${entry.id} listening target should include the catalogue number`);
    assert(entry.listening.bilibiliSearch.includes(encodedK), `${entry.id} Bilibili search should include encoded K catalogue number`);
    assert(entry.listening.youtubeSearch.includes(encodedK), `${entry.id} YouTube search should include encoded K catalogue number`);
    assert(entry.listening.appleMusicSearch.includes(encodedK), `${entry.id} Apple Music search should include encoded K catalogue number`);
  }
  const k488 = entries.find((item) => item.id === "vienna-1786-piano-concerto-23");
  assert(k488.listening.appleMusicSearch.includes("Mitsuko%20Uchida"), "K. 488 Apple Music search should prioritize Mitsuko Uchida");
  const k467 = entries.find((item) => item.id === "vienna-1785-piano-concerto-21");
  assert(k467.listening.appleMusicSearch.includes("Mitsuko%20Uchida"), "K. 467 Apple Music search should prioritize Mitsuko Uchida");
  const k545 = entries.find((item) => item.id === "vienna-1788-piano-sonata-16");
  assert(k545.listening.youtubeSearch.includes("K%20545"), "K. 545 YouTube search should include its catalogue number");
  assert(k545.listening.youtubeSearch.includes("Andante"), "K. 545 sleep playlist search should target the second movement");
  const figaro = entries.find((item) => item.id === "vienna-1786-figaro");
  assert(figaro.work.includes("Overture"), "Figaro coffee playlist node should match the overture playback target");
  assert(figaro.listening.youtubeSearch.includes("Overture"), "Figaro listening link should search the overture");
  const script = fs.readFileSync(scriptPath, "utf8");
  assert(script.indexOf('"Bilibili"') < script.indexOf('"YouTube"'), "Bilibili should be the first listening action");
  assert(script.indexOf('"YouTube"') < script.indexOf('"Apple Music"'), "YouTube should appear before Apple Music");
  assert(script.includes("detail-listening-target"), "detail rendering should show the exact listening target");
}

async function testFileProtocolFallback() {
  const fallback = [{ id: "inline-fallback" }];
  const api = loadJourneyApi({
    window: {
      MOZART_JOURNEY_DATA: fallback,
      location: { protocol: "file:" },
    },
    fetch: async () => {
      throw new TypeError("Failed to fetch");
    },
  });
  assert(typeof api.loadEntries === "function", "script must expose window.MozartJourney.loadEntries");
  const entries = await api.loadEntries();
  assert(entries === fallback, "file protocol should fall back to window.MOZART_JOURNEY_DATA when fetch fails");
}

const tests = [testPortfolioHome, testDataShape, testFilters, testFileProtocolFallback];
tests.push(testListeningLinks);

function testPlaceImages() {
  const entries = readJson(dataPath);
  const imageEntries = entries.filter((entry) => entry.place && entry.place.image);
  assert(imageEntries.length >= 5, "journey data should include images for core places");
  for (const entry of imageEntries) {
    const image = entry.place.image;
    assert(image.url && image.alt && image.caption, `${entry.id} place image should include url, alt, and caption`);
    assert(image.sourceLabel && image.sourceUrl, `${entry.id} place image should include source attribution`);
  }
}

tests.push(testPlaceImages);

function testFavoritesMarkdown() {
  const text = fs.readFileSync(favoritesPath, "utf8");
  assert(text.includes("萨尔茨堡三部曲"), "favorites.md should include the Salzburg trilogy section");
  assert(text.includes("压力大的时候会听"), "favorites.md should include the pressure listening section");
  assert(text.includes("Mozart 找工作"), "favorites.md should include the job-search section");
  assert(text.includes("我自己最喜欢弹的"), "favorites.md should include favorite pieces to play");
  assert(text.includes("我听过现场的"), "favorites.md should include live-heard works");
  assert(text.includes("Mozart Coffee Playlist"), "favorites.md should include the coffee playlist");
  assert(text.includes("Mozart Sleep Playlist"), "favorites.md should include the sleep playlist");
  assert(text.includes("英国下班"), "favorites.md should preserve the user's personal listening memory");
  assert(text.includes("Violin Concerto No. 3"), "favorites.md should include listed favorite works");
  assert(text.includes("Eine kleine Nachtmusik, K. 525"), "favorites.md should include K. 525 as a personal favorite");
}

tests.push(testFavoritesMarkdown);

function testContentAudit() {
  const text = fs.readFileSync(auditPath, "utf8");
  assert(text.includes("Mozart 内容精修审计"), "content-audit.md should describe the refinement audit");
  assert(text.includes("K. 216"), "content-audit.md should track K. 216");
  assert(text.includes("K. 466"), "content-audit.md should track K. 466");
  assert(text.includes("K. 622"), "content-audit.md should track K. 622");
  assert(text.includes("后续批次建议"), "content-audit.md should include next-batch guidance");
}

tests.push(testContentAudit);

function testSourceSummaryIsIntegrated() {
  const html = fs.readFileSync(journeyIndexPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");
  const styles = fs.readFileSync(journeyStylesPath, "utf8");
  assert(html.includes("detail-collections"), "detail page should include a collection label container");
  assert(html.includes("detail-listening"), "detail page should include a listening links container");
  assert(html.includes("detail-listening-target"), "detail page should show the exact listening target");
  assert(html.includes("detail-place-image"), "detail page should include a place image slot");
  assert(html.includes("detail-map-link"), "detail page should include a jump back to map control");
  assert(html.includes('data-theme="light"'), "page should declare an initial light theme");
  assert(html.includes('id="theme-toggle"'), "top navigation should include a theme toggle button");
  assert(html.includes("timeline-selection"), "timeline should show selected-work feedback without forcing navigation");
  assert(html.includes("timeline-detail-link"), "timeline should provide an explicit jump to detail control");
  assert(html.indexOf('id="collections"') > html.indexOf('id="detail"'), "collections should be reachable from nav but not placed before the main explorer/detail flow");
  assert(html.includes('aria-pressed="false"') || script.includes('aria-pressed'), "collection buttons should expose selected state accessibly");
  assert(script.includes('selectEntry(button.dataset.id, true, true)'), "collection clicks should select the work and jump to detail");
  assert(script.includes('selectEntry(entry.id, true, false)'), "timeline clicks should select the work and stay in the timeline flow");
  assert(script.includes('selectEntry(entry.id, false, false)'), "map marker clicks should select the work and stay on the map");
  assert(script.includes("popup-detail-link"), "map popups should provide an explicit jump to detail control");
  assert(script.includes("timeline-detail-link"), "timeline selection should provide an explicit jump to detail control");
  assert(script.includes("focusEntryOnMap(entry, true)"), "detail map control should jump back to the selected map location");
  assert(script.includes('collection-item")') && script.includes("is-active"), "collection clicks should have an active visual state");
  assert(styles.includes(".collection-item.is-active"), "collection active state should be styled");
  assert(styles.includes(".timeline-selection[hidden]"), "hidden timeline selection controls should not remain visible");
  assert(styles.includes(".popup-detail-link"), "map popup detail controls should be styled");
  assert(styles.includes(".detail-map-link[hidden]"), "hidden detail map links should not remain visible");
  assert(styles.includes(".detail-listening[hidden]"), "hidden listening blocks should not show stale playback details");
  assert(script.includes("links.replaceChildren()") && script.includes('target.textContent = ""'), "listening rendering should clear stale target and links when an entry has no playback data");
  assert(styles.includes(".place-image[hidden]"), "hidden place images should not leave an empty figure");
  assert(script.includes("mozart-journey-theme"), "theme preference should be stored under a stable localStorage key");
  assert(script.includes("localStorage.setItem"), "theme changes should persist to localStorage");
  assert(script.includes("prefers-color-scheme: dark"), "initial theme should respect dark system preference when no saved choice exists");
  assert(styles.includes("html[data-theme=\"dark\"]"), "stylesheet should include dark theme overrides");
  assert(styles.includes(".theme-toggle"), "theme toggle should be styled");
  assert(script.includes("img.onerror") && script.includes("地点图片暂时无法加载"), "failed place images should show a controlled fallback instead of a broken image");
  assert(!html.includes("detail-source-summary"), "source summaries should be integrated into detail copy, not shown as a separate block");
  assert(!html.includes("来源摘要"), "detail page should not include a standalone source summary heading");
  assert(!script.includes("renderSourceSummary"), "script should not render a standalone source summary block");
}

tests.push(testSourceSummaryIsIntegrated);

(async () => {
  for (const test of tests) {
    await test();
    console.log(`PASS ${test.name}`);
  }
})();
