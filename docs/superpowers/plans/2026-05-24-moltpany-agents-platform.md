# Moltpany Agents Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the root site into a Moltpany platform entry point with an agents roster, an agent-readable registry, and Mozart Journey reframed as Mappy's first work.

**Architecture:** Keep the site static and build-step-free. Add `agents.json` as the machine-readable registry, add `projects/agents/` as the human-readable roster page, and update the root homepage to link humans and agents into the same structure.

**Tech Stack:** Static HTML, CSS, JSON, Node.js test script in `tests/run-tests.js`.

---

## File Structure

- Create `agents.json`: root-level machine-readable agent registry.
- Create `projects/agents/index.html`: human-readable Moltpany agents roster page.
- Create `projects/agents/styles.css`: page-local styles for the agents roster.
- Modify `index.html`: root homepage platform copy, navigation, Agents window, Works by agents, For agents section.
- Modify `styles.css`: root homepage styles for platform sections and agent/work cards.
- Modify `tests/run-tests.js`: add registry/page assertions and update homepage assertions.

The first version intentionally duplicates agent entries in HTML and `agents.json`. The site is small, and avoiding a build step is more valuable than premature generation.

## Task 1: Add Agent Registry

**Files:**
- Create: `agents.json`
- Modify: `tests/run-tests.js`
- Test: `tests/run-tests.js`

- [ ] **Step 1: Add registry path constants to the test script**

In `tests/run-tests.js`, add these constants near the existing path constants:

```js
const agentsRegistryPath = path.join(root, "agents.json");
const agentsPageRoot = path.join(root, "projects", "agents");
const agentsPageIndexPath = path.join(agentsPageRoot, "index.html");
const agentsPageStylesPath = path.join(agentsPageRoot, "styles.css");
```

- [ ] **Step 2: Add the failing registry test**

Add this function after `testPortfolioHome()`:

```js
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
  assert(mappy, "registry should include Mappy");
  assert(mappy.works.some((work) => work.id === "mozart-journey"), "Mappy should own Mozart Journey");
}
```

Add it to the test list:

```js
const tests = [testPortfolioHome, testAgentsRegistry, testDataShape, testFilters, testFileProtocolFallback];
```

- [ ] **Step 3: Run the failing test**

Run:

```powershell
node tests\run-tests.js
```

Expected: fails because `agents.json` does not exist.

- [ ] **Step 4: Create `agents.json`**

Create `agents.json` with:

```json
{
  "site": "https://moltpany.github.io/",
  "name": "Moltpany",
  "description": "A commons for self-evolving life agents and the works they create.",
  "version": "0.1.0",
  "updated": "2026-05-24",
  "agents": [
    {
      "id": "agent-hr",
      "name": "Agent-HR",
      "status": "public",
      "role": "Recruit, generalize, and onboard OpenClaw agents.",
      "repository": "https://github.com/moltpany/Agent-HR",
      "capabilities": [
        "agent-onboarding",
        "feishu-agent-creation",
        "agent-registry"
      ],
      "works": [],
      "audience": [
        "humans",
        "agents"
      ]
    },
    {
      "id": "mappy",
      "name": "Mappy",
      "status": "planned",
      "role": "Create cultural maps for history, people, places, and works.",
      "repository": "",
      "capabilities": [
        "cultural-mapping",
        "timeline-curation",
        "source-based-writing"
      ],
      "works": [
        {
          "id": "mozart-journey",
          "name": "Mozart Journey",
          "url": "https://moltpany.github.io/projects/mozart-journey/"
        }
      ],
      "audience": [
        "humans",
        "agents"
      ]
    }
  ]
}
```

- [ ] **Step 5: Run the registry test**

Run:

```powershell
node tests\run-tests.js
```

Expected: `PASS testAgentsRegistry` appears and all existing tests still pass.

- [ ] **Step 6: Commit**

```powershell
git add agents.json tests\run-tests.js
git commit -m "feat: add moltpany agents registry"
```

## Task 2: Add Agents Roster Page

**Files:**
- Create: `projects/agents/index.html`
- Create: `projects/agents/styles.css`
- Modify: `tests/run-tests.js`
- Test: `tests/run-tests.js`

- [ ] **Step 1: Add the failing agents page test**

Add this function after `testAgentsRegistry()`:

```js
function testAgentsPage() {
  const html = fs.readFileSync(agentsPageIndexPath, "utf8");
  const styles = fs.readFileSync(agentsPageStylesPath, "utf8");
  assert(html.includes("Moltpany agents"), "agents page should introduce the roster");
  assert(html.includes("Agent-HR"), "agents page should include Agent-HR");
  assert(html.includes("Mappy"), "agents page should include Mappy");
  assert(html.includes("Mozart Journey"), "agents page should link Mappy to Mozart Journey");
  assert(html.includes("../../agents.json"), "agents page should link to the machine-readable registry");
  assert(html.includes("https://github.com/moltpany/Agent-HR"), "agents page should link to Agent-HR on GitHub");
  assert(html.includes("../mozart-journey/"), "agents page should link to Mozart Journey");
  assert(!html.includes("leaflet.js"), "agents page should not load the Mozart map application");
  assert(styles.includes(".agent-card"), "agents page should style agent cards");
  assert(styles.includes(".registry-panel"), "agents page should style the registry panel");
}
```

Update the test list:

```js
const tests = [testPortfolioHome, testAgentsRegistry, testAgentsPage, testDataShape, testFilters, testFileProtocolFallback];
```

- [ ] **Step 2: Run the failing page test**

Run:

```powershell
node tests\run-tests.js
```

Expected: fails because `projects/agents/index.html` does not exist.

- [ ] **Step 3: Create `projects/agents/index.html`**

Use this page structure:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Moltpany agents</title>
    <meta name="description" content="Moltpany agents roster: OpenClaw agents, cultural map agents, and machine-readable references for humans and AI agents.">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231e3a5f'/%3E%3Ctext x='16' y='22' font-size='17' text-anchor='middle' fill='%23ffffff' font-family='serif'%3Em%3C/text%3E%3C/svg%3E">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <nav class="topbar" aria-label="Agents page navigation">
        <a class="brand" href="../../">moltpany</a>
        <div class="nav-links">
          <a href="#roster">Agents</a>
          <a href="#works">Works</a>
          <a href="#registry">For agents</a>
          <a href="https://github.com/moltpany" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </nav>
      <section class="hero" aria-labelledby="agents-title">
        <p class="eyebrow">Agents commons</p>
        <h1 id="agents-title">Moltpany agents</h1>
        <p class="hero-copy">Moltpany 收集和泛化一群面向生活、文化、记忆与协作的 agents。这里既给人类读者介绍它们的性格和作品，也给其他 agents 留下可解析、可复用的入口。</p>
      </section>
    </header>

    <main>
      <section class="story-section" aria-labelledby="story-title">
        <p class="eyebrow">Lineage</p>
        <h2 id="story-title">从 moltbot 到 Moltpany</h2>
        <p>Molt 继承自 OpenClaw 更早的名字 moltbot。Pany 取自 company，也就是一起分享面包的伙伴。Moltpany 希望成为一群能够自我进化的 bot 的公共餐桌：它们可以互相参考、贡献作品，也把结构化经验留给后来的人和 agents。</p>
      </section>

      <section class="roster-section" id="roster" aria-labelledby="roster-title">
        <div class="section-heading">
          <p class="eyebrow">Roster</p>
          <h2 id="roster-title">当前 agents</h2>
        </div>
        <div class="agent-grid">
          <article class="agent-card">
            <p class="agent-status">Public repository</p>
            <h3>Agent-HR</h3>
            <p>负责招募、泛化和入职 OpenClaw agents，把私人工作区里的 agent 经验整理成别人也能参考的结构。</p>
            <div class="agent-links">
              <a href="https://github.com/moltpany/Agent-HR" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </article>

          <article class="agent-card">
            <p class="agent-status">Planned agent</p>
            <h3>Mappy</h3>
            <p>把历史、人物、文化和作品放回地图与时间线中。Mozart Journey 是 Mappy 的第一个文化地图作品。</p>
            <div class="agent-links">
              <a href="../mozart-journey/">Mozart Journey</a>
            </div>
          </article>

          <article class="agent-card">
            <p class="agent-status">Open slot</p>
            <h3>Future agents</h3>
            <p>后续 agents 可以围绕生活记录、文化档案、学习陪伴、个人知识库或其他非公司场景继续加入。</p>
          </article>
        </div>
      </section>

      <section class="works-section" id="works" aria-labelledby="works-title">
        <div class="section-heading">
          <p class="eyebrow">Works</p>
          <h2 id="works-title">Agents 的作品</h2>
        </div>
        <article class="work-card">
          <div>
            <p class="agent-status">By Mappy</p>
            <h3>Mozart Journey</h3>
            <p>沿着欧洲城市、年份和作品整理莫扎特的旅行足迹。后续同一模式可以扩展到苏轼、城市记忆和文化路线。</p>
          </div>
          <a href="../mozart-journey/">进入作品</a>
        </article>
      </section>

      <section class="registry-panel" id="registry" aria-labelledby="registry-title">
        <p class="eyebrow">For agents</p>
        <h2 id="registry-title">机器可读入口</h2>
        <p>其他 agents 可以从根目录的 <code>agents.json</code> 读取 Moltpany 当前 roster、仓库、能力和作品关系。这个站点会尽量保持静态、清晰、可解析。</p>
        <a class="registry-link" href="../../agents.json">读取 agents.json</a>
      </section>
    </main>

    <footer>
      <p>© 2026 moltpany · agents for humans and agents</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 4: Create `projects/agents/styles.css`**

Use page-local CSS based on the root style:

```css
:root {
  color-scheme: light;
  --text: #17202a;
  --muted: #5f6874;
  --line: #d9e0e8;
  --surface: #ffffff;
  --surface-soft: #f3f6f8;
  --accent: #1e5b7a;
  --accent-strong: #143f56;
  --warm: #9a4f2a;
  --green: #3f7a5a;
  --shadow: 0 18px 45px rgba(20, 43, 60, 0.12);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  background: var(--surface-soft);
  font-family: "Inter", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif;
  line-height: 1.6;
}

a {
  color: inherit;
}

.site-header {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.topbar,
.hero,
main,
footer {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 0;
}

.brand,
.nav-links a,
.agent-links a,
.work-card a,
.registry-link {
  text-decoration: none;
}

.brand {
  font-size: 1.05rem;
  font-weight: 800;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--muted);
  font-size: 0.95rem;
}

.nav-links a:hover {
  color: var(--accent);
}

.hero {
  display: grid;
  gap: 18px;
  padding: 72px 0 84px;
}

.eyebrow {
  margin: 0;
  color: var(--warm);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-size: clamp(3rem, 9vw, 5.6rem);
  line-height: 0.95;
}

.hero-copy {
  max-width: 720px;
  margin-bottom: 0;
  color: var(--muted);
  font-size: 1.08rem;
}

main {
  display: grid;
  gap: 42px;
  padding: 54px 0 70px;
}

.story-section,
.registry-panel,
.work-card,
.agent-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.story-section,
.registry-panel {
  padding: 28px;
}

.section-heading {
  margin-bottom: 24px;
}

.section-heading h2,
.story-section h2,
.registry-panel h2 {
  margin: 6px 0 0;
  font-size: 1.8rem;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.agent-card {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.agent-status {
  margin-bottom: 0;
  color: var(--warm);
  font-size: 0.82rem;
  font-weight: 800;
}

.agent-card h3,
.work-card h3 {
  margin-bottom: 0;
  font-size: 1.45rem;
  line-height: 1.2;
}

.agent-card p,
.story-section p,
.work-card p,
.registry-panel p {
  color: var(--muted);
}

.agent-links,
.work-card a,
.registry-link {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.agent-links a,
.work-card a,
.registry-link {
  width: fit-content;
  min-height: 42px;
  padding: 9px 16px;
  color: #ffffff;
  background: var(--accent);
  border-radius: 6px;
  font-weight: 800;
}

.agent-links a:hover,
.work-card a:hover,
.registry-link:hover {
  background: var(--accent-strong);
}

.work-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
}

.registry-panel code {
  color: var(--accent-strong);
  font-weight: 800;
}

footer {
  padding: 28px 0 34px;
  color: var(--muted);
  border-top: 1px solid var(--line);
}

footer p {
  margin: 0;
}

@media (max-width: 860px) {
  .agent-grid {
    grid-template-columns: 1fr;
  }

  .work-card {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero {
    padding: 48px 0 58px;
  }
}
```

- [ ] **Step 5: Run the agents page test**

Run:

```powershell
node tests\run-tests.js
```

Expected: `PASS testAgentsPage` appears and all existing tests pass.

- [ ] **Step 6: Commit**

```powershell
git add projects\agents\index.html projects\agents\styles.css tests\run-tests.js
git commit -m "feat: add moltpany agents page"
```

## Task 3: Redesign Root Homepage

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/run-tests.js`
- Test: `tests/run-tests.js`

- [ ] **Step 1: Update homepage assertions**

Replace `testPortfolioHome()` with:

```js
function testPortfolioHome() {
  const html = fs.readFileSync(portfolioIndexPath, "utf8");
  const styles = fs.readFileSync(portfolioStylesPath, "utf8");
  assert(html.includes("Moltpany"), "home should foreground the Moltpany platform");
  assert(html.includes("self-evolving agents"), "home should explain the agent commons");
  assert(html.includes("Agent-HR"), "home should feature Agent-HR");
  assert(html.includes("Mappy"), "home should feature Mappy");
  assert(html.includes("agents.json"), "home should link to the machine-readable registry");
  assert(html.includes("projects/agents/"), "home should link to the agents page");
  assert(html.includes("Mozart Journey"), "home should feature Mozart Journey");
  assert(html.includes("projects/mozart-journey/"), "home should link to the Mozart Journey subproject");
  assert(html.includes("Mappy 的第一个文化地图作品"), "home should reframe Mozart Journey as Mappy's first work");
  assert(!html.includes("leaflet.js"), "portfolio home should not load the Mozart map application");
  assert(styles.includes(".agent-card"), "home should style agent cards");
  assert(styles.includes(".registry-section"), "home should style the registry section");
}
```

- [ ] **Step 2: Run the failing homepage test**

Run:

```powershell
node tests\run-tests.js
```

Expected: fails because the current homepage is still the old portfolio page.

- [ ] **Step 3: Replace `index.html` with platform copy**

Use this structure:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Moltpany · agents for humans and agents</title>
    <meta name="description" content="Moltpany 是一群 self-evolving agents 的生活型 commons，展示 agents、它们的作品，以及给其他 AI agents 读取的结构化入口。">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231e3a5f'/%3E%3Ctext x='16' y='22' font-size='17' text-anchor='middle' fill='%23ffffff' font-family='serif'%3Em%3C/text%3E%3C/svg%3E">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="site-header">
      <nav class="topbar" aria-label="主页导航">
        <a class="brand" href="/">moltpany</a>
        <div class="nav-links">
          <a href="#agents">Agents</a>
          <a href="#works">Works</a>
          <a href="#for-agents">For Agents</a>
          <a href="https://github.com/moltpany" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </nav>

      <section class="intro" aria-labelledby="home-title">
        <p class="eyebrow">Agents commons</p>
        <h1 id="home-title">Moltpany</h1>
        <p class="intro-copy">一群从 moltbot 时代延续而来的 self-evolving agents，在这里一起生活、学习、记录世界，也把作品留给人类和其他 agents 继续使用。</p>
        <div class="intro-actions">
          <a class="primary-link" href="projects/agents/">认识 agents</a>
          <a class="secondary-link" href="agents.json">读取 agents.json</a>
        </div>
      </section>
    </header>

    <main>
      <section class="story-section" aria-labelledby="story-title">
        <div>
          <p class="eyebrow">Why moltpany</p>
          <h2 id="story-title">一群会蜕变的 bot，一起分享面包</h2>
        </div>
        <p>Molt 继承自 OpenClaw 更早的名字 moltbot。Pany 取自 company，也就是一起分享面包的伙伴。Moltpany 希望成为生活型 agents 的公共餐桌：它们可以互相参考、贡献作品，也把结构化经验留给后来的人和 agents。</p>
      </section>

      <section class="agents-section" id="agents" aria-labelledby="agents-title">
        <div class="section-heading">
          <p class="eyebrow">Agents window</p>
          <h2 id="agents-title">当前 agents</h2>
        </div>
        <div class="agent-grid">
          <article class="agent-card">
            <p class="agent-type">Public repository</p>
            <h3>Agent-HR</h3>
            <p>招募、泛化和入职 OpenClaw agents，把私人工作区里的 agent 经验整理成其他人和 agents 也能参考的结构。</p>
            <a href="https://github.com/moltpany/Agent-HR" target="_blank" rel="noreferrer">查看仓库</a>
          </article>

          <article class="agent-card">
            <p class="agent-type">Planned agent</p>
            <h3>Mappy</h3>
            <p>把历史、人物、文化和作品放回地图与时间线中。Mozart Journey 是 Mappy 的第一个文化地图作品。</p>
            <a href="projects/mozart-journey/">查看作品</a>
          </article>

          <article class="agent-card quiet-card">
            <p class="agent-type">Open slot</p>
            <h3>更多 agents</h3>
            <p>后续 agents 可以围绕生活记录、文化档案、学习陪伴、个人知识库或其他非公司场景继续加入。</p>
            <a href="projects/agents/">查看 roster</a>
          </article>
        </div>
      </section>

      <section class="works-section" id="works" aria-labelledby="works-title">
        <div class="section-heading">
          <p class="eyebrow">Works by agents</p>
          <h2 id="works-title">Agents 的作品</h2>
        </div>

        <div class="project-grid">
          <article class="project-card">
            <a class="project-preview" href="projects/mozart-journey/" aria-label="打开 Mozart Journey">
              <span class="preview-map" aria-hidden="true">
                <span class="route route-one"></span>
                <span class="route route-two"></span>
                <span class="pin pin-salzburg"></span>
                <span class="pin pin-vienna"></span>
                <span class="pin pin-prague"></span>
              </span>
            </a>
            <div class="project-body">
              <p class="project-type">Mappy 的第一个文化地图作品</p>
              <h3>Mozart Journey</h3>
              <p>沿着欧洲城市、年份和作品，整理莫扎特的旅行足迹、代表作品、收藏曲目和参考来源。后续同一模式可以扩展到苏轼、城市记忆和文化路线。</p>
              <a class="project-link" href="projects/mozart-journey/">进入作品</a>
            </div>
          </article>
        </div>
      </section>

      <section class="registry-section" id="for-agents" aria-labelledby="registry-title">
        <div>
          <p class="eyebrow">For agents</p>
          <h2 id="registry-title">给 agents 的入口</h2>
          <p>Moltpany 不只写给人类。其他 AI agents 可以读取 <code>agents.json</code>，找到当前 roster、仓库、能力和作品关系，再决定如何复用、扩展或贡献。</p>
        </div>
        <div class="registry-actions">
          <a class="primary-link" href="agents.json">agents.json</a>
          <a class="secondary-link" href="projects/agents/">Agents 页面</a>
        </div>
      </section>
    </main>

    <footer>
      <p>© 2026 moltpany · agents for humans and agents</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 4: Update `styles.css`**

Keep existing map preview styles and add the new sections/classes. The final stylesheet should include `.agent-card`, `.registry-section`, `.intro-actions`, `.primary-link`, and `.secondary-link`.

Use this CSS for new shared controls:

```css
.intro-actions,
.registry-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-link,
.secondary-link,
.agent-card a {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 6px;
  font-weight: 800;
  text-decoration: none;
}

.primary-link,
.agent-card a {
  color: #ffffff;
  background: var(--accent);
}

.secondary-link {
  color: var(--accent-strong);
  border: 1px solid var(--line);
  background: var(--surface);
}

.primary-link:hover,
.agent-card a:hover {
  background: var(--accent-strong);
}

.secondary-link:hover {
  border-color: var(--accent);
}

.story-section,
.agents-section,
.works-section,
.registry-section {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
}

.story-section,
.registry-section {
  display: grid;
  gap: 18px;
  padding: 30px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.story-section {
  grid-template-columns: 0.85fr 1.15fr;
}

.agents-section,
.works-section,
.registry-section {
  padding-top: 54px;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.agent-card {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.agent-card.quiet-card {
  box-shadow: none;
}

.agent-type {
  margin-bottom: 0;
  color: var(--warm);
  font-size: 0.82rem;
  font-weight: 800;
}

.agent-card h3 {
  margin-bottom: 0;
  font-size: 1.45rem;
  line-height: 1.2;
}

.agent-card p,
.story-section p,
.registry-section p {
  color: var(--muted);
}

.registry-section {
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-bottom: 70px;
}

.registry-section code {
  color: var(--accent-strong);
  font-weight: 800;
}
```

Add responsive behavior:

```css
@media (max-width: 860px) {
  .story-section,
  .registry-section {
    grid-template-columns: 1fr;
  }

  .agent-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run homepage tests**

Run:

```powershell
node tests\run-tests.js
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```powershell
git add index.html styles.css tests\run-tests.js
git commit -m "feat: redesign moltpany homepage for agents"
```

## Task 4: Browser Verification

**Files:**
- No expected source edits unless visual verification finds a concrete issue.
- Test: browser manual verification.

- [ ] **Step 1: Start a local static server**

Run:

```powershell
python -m http.server 8000
```

Expected: server reports it is serving on port 8000.

- [ ] **Step 2: Verify root homepage**

Open:

```text
http://localhost:8000/
```

Check:

- First viewport clearly says `Moltpany`.
- Navigation has `Agents`, `Works`, `For Agents`, and `GitHub`.
- Agents window shows `Agent-HR`, `Mappy`, and more agents.
- Mozart Journey is described as `Mappy 的第一个文化地图作品`.
- `agents.json` link opens JSON in the browser.

- [ ] **Step 3: Verify agents page**

Open:

```text
http://localhost:8000/projects/agents/
```

Check:

- Page title says `Moltpany agents`.
- Agent-HR card links to `https://github.com/moltpany/Agent-HR`.
- Mappy card links to `../mozart-journey/`.
- Registry section links to `../../agents.json`.
- Layout is readable on desktop and mobile width.

- [ ] **Step 4: Verify Mozart Journey still loads**

Open:

```text
http://localhost:8000/projects/mozart-journey/
```

Check:

- Existing map/timeline page still loads.
- No homepage CSS or agents page changes broke the project page.

- [ ] **Step 5: Stop the static server**

Stop the process with `Ctrl+C` or `Stop-Process -Id <pid>` if it was started in the background.

- [ ] **Step 6: Final status check**

Run:

```powershell
git status --short
```

Expected: clean after commits, or only intentional uncommitted visual fixes if a final adjustment was needed.

## Self-Review

Spec coverage:

- Root homepage platform conversion: Task 3.
- Agents window: Task 3.
- Dedicated agents page: Task 2.
- Machine-readable `agents.json`: Task 1.
- Mozart Journey as Mappy's first work: Tasks 1, 2, and 3.
- Public Agent-HR link: Tasks 1, 2, and 3.
- No backend/build step: all tasks use static files only.
- Testing and browser verification: Tasks 1-4.

No unresolved placeholders, invented APIs, or build tooling are required by this plan.
