const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const portfolioIndexPath = path.join(root, "index.html");
const portfolioStylesPath = path.join(root, "styles.css");
const agentsRegistryPath = path.join(root, "agents.json");
const agentsPageRoot = path.join(root, "projects", "agents");
const agentsPageIndexPath = path.join(agentsPageRoot, "index.html");
const agentsPageStylesPath = path.join(agentsPageRoot, "styles.css");

const MOZART_JOURNEY_URL = "https://moltpany.github.io/mozart-journey/";
const AGENT_MAPPY_REPOSITORY = "https://github.com/moltpany/Agent-Mappy";
const AGENT_MALIANG_REPOSITORY = "https://github.com/moltpany/Agent-Maliang";
const MAGIC_MIRROR_URL = "https://github.com/moltpany/magic-mirror";
const AGENT_NOVA_AVATAR = "assets/agents/agent-nova.webp";
const AGENT_MAPPY_AVATAR = "assets/agents/agent-mappy.webp";
const VISUAL_AGENT_SERIAL_PATTERN = /\b(?:mp|ob)-\d{3}\b/i;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function testPortfolioHome() {
  const html = fs.readFileSync(portfolioIndexPath, "utf8");
  const styles = fs.readFileSync(portfolioStylesPath, "utf8");
  assert(html.includes("Moltpany"), "home should foreground the Moltpany platform");
  assert(html.includes("self-evolving agents"), "home should explain the agent commons");
  assert(html.includes("Agent-HR"), "home should feature Agent-HR");
  assert(html.includes("Agent-Mappy"), "home should feature Agent-Mappy");
  assert(html.includes("Agent-Maliang"), "home should feature Agent-Maliang");
  assert(html.includes(AGENT_MALIANG_REPOSITORY), "home should link to the Agent-Maliang repository");
  assert(html.includes("Magic Mirror"), "home should feature Magic Mirror");
  assert(html.includes(MAGIC_MIRROR_URL), "home should link to the Magic Mirror work repository");
  assert(html.includes(AGENT_MAPPY_REPOSITORY), "home should link to the Agent-Mappy repository");
  assert(html.includes(AGENT_NOVA_AVATAR), "home should reference Agent-Nova avatar artwork");
  assert(html.includes(AGENT_MAPPY_AVATAR), "home should reference Agent-Mappy avatar artwork");
  assert(fs.existsSync(path.join(root, AGENT_NOVA_AVATAR)), "Agent-Nova avatar file should exist");
  assert(fs.existsSync(path.join(root, AGENT_MAPPY_AVATAR)), "Agent-Mappy avatar file should exist");
  assert(html.includes("agents.json"), "home should link to the machine-readable registry");
  assert(html.includes("projects/agents/"), "home should link to the agents page");
  assert(html.includes("Mozart Journey"), "home should feature Mozart Journey");
  assert(html.includes(MOZART_JOURNEY_URL), "home should link to the migrated Mozart Journey subproject");
  assert(!html.includes("projects/mozart-journey/"), "home should not link to the legacy in-repo Mozart Journey path");
  assert(html.includes("Agent-Mappy 的第一个文化地图作品"), "home should reframe Mozart Journey as Agent-Mappy's first work");
  assert(!VISUAL_AGENT_SERIAL_PATTERN.test(html), "home should not show visual agent serial numbers like mp-001 or ob-001");
  assert(!html.includes("leaflet.js"), "portfolio home should not load the Mozart map application");
  assert(styles.includes(".agent-card"), "home should style agent cards");
  assert(styles.includes(".registry-section"), "home should style the registry section");
}

function testAgentsRegistry() {
  const registry = readJson(agentsRegistryPath);
  assert(registry.site === "https://moltpany.github.io/", "agents registry should identify the public site");
  assert(registry.name === "Moltpany", "agents registry should identify Moltpany");
  assert(Array.isArray(registry.agents), "agents registry should include an agents array");
  assert(registry.agents.length >= 2, "agents registry should include the first public/planned agents");

  const ids = new Set();
  for (const agent of registry.agents) {
    assert(agent.id && !ids.has(agent.id), `agent id should be present and unique: ${agent.id}`);
    ids.add(agent.id);
    assert(agent.name && agent.role && agent.status, `${agent.id} should include name, role, and status`);
    assert(Array.isArray(agent.capabilities), `${agent.id} should include capabilities`);
    assert(Array.isArray(agent.works), `${agent.id} should include works`);
    assert(Array.isArray(agent.audience), `${agent.id} should include audience`);
    assert(agent.audience.includes("humans") && agent.audience.includes("agents"), `${agent.id} should address humans and agents`);
  }

  const hr = registry.agents.find((agent) => agent.id === "agent-hr");
  assert(hr, "registry should include Agent-HR");
  assert(hr.repository === "https://github.com/moltpany/Agent-HR", "Agent-HR should link to its public repository");
  assert(hr.capabilities.includes("agent-onboarding"), "Agent-HR should expose onboarding capability");

  const mappy = registry.agents.find((agent) => agent.id === "mappy");
  assert(mappy, "registry should include Agent-Mappy under stable mappy id");
  assert(mappy.name === "Agent-Mappy", "Mappy registry entry should use Agent-Mappy as the display name");
  assert(mappy.repository === AGENT_MAPPY_REPOSITORY, "Agent-Mappy should link to its public repository");
  const mozartJourney = mappy.works.find((work) => work.id === "mozart-journey");
  assert(mozartJourney, "Agent-Mappy should own Mozart Journey");
  assert(mozartJourney.url === MOZART_JOURNEY_URL, "Mozart Journey work URL should point at the migrated standalone site");

  const maliang = registry.agents.find((agent) => agent.id === "maliang");
  assert(maliang, "registry should include Agent-Maliang");
  assert(maliang.name === "Agent-Maliang", "Maliang registry entry should use Agent-Maliang as the display name");
  assert(maliang.repository === AGENT_MALIANG_REPOSITORY, "Agent-Maliang should link to its public repository");
  const magicMirror = maliang.works.find((work) => work.id === "magic-mirror");
  assert(magicMirror, "Agent-Maliang should own Magic Mirror");
  assert(magicMirror.url === MAGIC_MIRROR_URL, "Magic Mirror work URL should point at its source repository");
}

function testAgentsPage() {
  const html = fs.readFileSync(agentsPageIndexPath, "utf8");
  const styles = fs.readFileSync(agentsPageStylesPath, "utf8");
  assert(html.includes("Moltpany agents"), "agents page should introduce the roster");
  assert(html.includes("Agent-HR"), "agents page should include Agent-HR");
  assert(html.includes("Agent-Mappy"), "agents page should include Agent-Mappy");
  assert(html.includes("Agent-Maliang"), "agents page should include Agent-Maliang");
  assert(html.includes(AGENT_MALIANG_REPOSITORY), "agents page should link to Agent-Maliang on GitHub");
  assert(html.includes("Magic Mirror"), "agents page should link Agent-Maliang to Magic Mirror");
  assert(html.includes(MAGIC_MIRROR_URL), "agents page should link to the Magic Mirror source repository");
  assert(html.includes("Mozart Journey"), "agents page should link Agent-Mappy to Mozart Journey");
  assert(html.includes("../../agents.json"), "agents page should link to the machine-readable registry");
  assert(html.includes("https://github.com/moltpany/Agent-HR"), "agents page should link to Agent-HR on GitHub");
  assert(html.includes(AGENT_MAPPY_REPOSITORY), "agents page should link to Agent-Mappy on GitHub");
  assert(html.includes(MOZART_JOURNEY_URL), "agents page should link to the migrated Mozart Journey site");
  assert(!html.includes("../mozart-journey/"), "agents page should not link to the legacy sibling Mozart Journey path");
  assert(!VISUAL_AGENT_SERIAL_PATTERN.test(html), "agents page should not show visual agent serial numbers like mp-001 or ob-001");
  assert(!html.includes("leaflet.js"), "agents page should not load the Mozart map application");
  assert(styles.includes(".agent-card"), "agents page should style agent cards");
  assert(styles.includes(".registry-panel"), "agents page should style the registry panel");
}

const tests = [testPortfolioHome, testAgentsRegistry, testAgentsPage];

(async () => {
  for (const test of tests) {
    await test();
    console.log(`PASS ${test.name}`);
  }
})();
