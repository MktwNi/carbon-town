# CLAUDE.md — GHG Town 3D (เมืองคาร์บอน)

Talk to the user in **Thai**. He is a GHG Lead Verifier (CFO/CFP) at GCC, not a full-time developer:
explain each step in one or two plain Thai sentences, and **ask before anything that publishes, changes visibility, or deletes**.

## What this repository is

A static website (no backend, no framework, no bundler). `index.html` loads, in order:
`js/three.min.js` → `js/ghg3-engine.min.js` → `js/content.js` → `js/dc-lite.js` → `js/app.js`.

| Kind | Files | Rule |
|---|---|---|
| Content (data) | `js/content.js` | Edit directly; no build. Plain JS that sets `window.GHGTownContent`. |
| Media (data) | `js/media.js` | Optional real-world clip per stop (`window.GHGTownMedia = { 6: { video, title, credit } }`, YouTube link or a file path). Adds a "วิดีโอจริง" tab to that stop's card. |
| UI source | `src/ui/Main.dc.html` | Template + logic. Also the source of the Claude Design version: keep its `/_blob/...` URLs, `ENGINE_BLOB` / `CONTENT_BLOB` placeholders and `support.js` line as they are. |
| Engine source | `src/engine/*.js` | 13 modules; concatenation order is `ENGINE_ORDER` in `src/tools/build.mjs` (v0.8 added `audio.js`, v1.0 `film.js`; a new module must also go in the `MIXIN` list there). |
| **Generated** | `js/app.js`, `js/ghg3-engine.min.js`, `js/dc-lite.js` | Never hand-edit. Run `npm install` once, then `npm run build`, and commit them with the sources. |
| Vendor | `js/three.min.js` | three.js **r149** (MIT). Do not upgrade: the engine targets r149. |
| Static | `assets/`, `index.html` | Mascot sprite sheets (5×5 poses each), icons, link-preview cover. |

Local preview: `npm run serve` → <http://localhost:8080/> (or open `index.html` directly).

v0.8 runtime notes:
- Progress (answers, clues, weather, labels, sound, trainee name, last position) is saved in `localStorage` key `ghg-town-3d:v1` (`_uSave` / `_uRestore` in the UI). Bump the key only if the saved shape changes incompatibly.
- Fast travel: `_eHop(districtId | 'gate')` and `_eHopStop(id)` in `play.js` fly the drone to a spot ~24 m before a stop's viewpoint (on the deck for raised lookouts). Compass for the hint beacon: `_pCompass` → `eHintAng` / `eHintD`.
- Touch: a finger put down on the left 45 % of the 3D view is a joystick (`E.joy`, drawn into the `.ghg-joy` element); the right side looks around. Tapping the source while hunting counts as found (`_pSeekTap`).
- `audio.js` is procedural Web Audio (no sound files); `_tickAudio` runs in `core.js` `_step`, `_eSound(on)` mutes, `_auSfx(name)` plays UI cues.
- `src/ui/dc-lite.js` resolves `<dc-keep>` placeholders inside newly inserted subtrees (this fixed the minimap canvas vanishing).

v0.9 notes:
- UI: full-screen 3D view in map mode (the page `<header>` only shows in the summary-table view). In-game top bar = status card (`.ghg-status`, opens the riddle book) + fast travel + one menu (`moreOpen`: modes, weather, sound, labels, table, help). Theme: Prompt headings, glass panels (`.g-glass` / `.g-float`), primary `#0B7D43`; the certificate keeps its own dark green / cream.
- Crowd LOD in `actors.js`: `p.lod` 2 = near (< 32 m, `_acNearParts`: lofted bodies `_acLoftGeo`, faces `_acNFace`, skull-following hair `_acNHairCap`, styles in `p.hs`), 1 = light parts, 0 = 3-box impostor. Every crowd mesh carries `lod`.
- City: tree canopies `_wBlob` (welded lumpy spheres, baked shading), contact shading on grounded `box()` sides (`o.ao`, opt out with `noAO`), vehicle greenhouse `cabin()` in `_wVehGeo`.
- Smoothness: `core._loop` steps with the rAF timestamp and an eased `dtS`; shaders are pre-compiled at boot; `tune.js` lowers / restores the pixel ratio around ~48 fps; mouse look is queued in `E.lookQ` and eased in `_tickPlayer`.

v1.0 notes:
- Site-visit film (`film.js`): the first arrival at an unsolved stop (`_pArrive` and the found path in `_tickTour` call `_fmArrive`) plays a ~12 s clip before `eArrived` reaches the UI. Shots are planned from the anchor (`_fmPlan`: aerial arc on the viewpoint side, walk-in from `view` towards `look`, close-up orbit in open ground or a push-in among walls) and checked against the colliders. The UI shows it from `eFilm` / `eFilmShot`; per-frame HUD bits are written into the kept element `.ghg-fm-live` (`filmRef` → `_fmAttach`). Space / Esc skip (`_eFilmSkip`); the card replays it (`_eFilm`). The evidence photo is read right after the frame is drawn (`core._loop` → `_fmSnap` → UI `_uPhoto`, saved under the storage key + `:photos`).
- Gas puffs: one `type: 'gas'` emitter per gas per stop (none for scope 2), own particle pool `E.partsG`; pale while the gas is the answer (`E.gasHide`), the gas colour once solved.
- Thai narration: UI `_uSay` (Web Speech API, best Thai voice via `_uTtsVoice`, `_uSayText` spells out formulas and units). It reads film cues (`_uFilmCue`), the speaking mascot's line and the question; the film holds its close-up while it is still speaking (`E.narrOn`). Menu switches: `filmAuto`, `narr` (saved with the progress).

Deployment (current): repository <https://github.com/MktwNi/carbon-town> (public), GitHub Pages source **"Deploy from a branch" → `main` / root**,
with an empty `.nojekyll` so files are served as-is. Every push to `main` redeploys in about a minute; live site <https://mktwni.github.io/carbon-town/>.
The GitHub CLI is installed at `~/.local/bin/gh` (not on PATH); its token has no `workflow` scope, so the Actions workflow is parked at
`src/tools/deploy-pages.yml` (its header explains how to switch). The runbook below is the original Actions-based first-time setup.

## Deploy runbook (first time)

0. **Preflight** — run and read the output:
   - `git --version` and `gh --version`. If `gh` is missing on macOS: `brew install gh` (if Homebrew is missing too, tell the user and point to <https://cli.github.com>).
   - `gh auth status`. If not logged in, ask the user to run `gh auth login` himself (GitHub.com → HTTPS → Login with a web browser); it is interactive. Continue when it reports logged in.
1. **Ask once** (one message, Thai): repository name (default `ghg-town-3d`) and public/private.
   Tell him: on a free GitHub plan Pages needs a **public** repository; the website itself is open to anyone with the link either way; the code, training content and GCC mascot artwork will be visible on GitHub if public — he should be sure GCC is fine with that.
2. **Check the build is current**: `npm install && npm run build`, then `git status --porcelain js/` (or, before `git init`, just note the result). Changed files mean a source was edited after the last build — that is fine, they get committed.
3. **Create the repository and push** (skip `git init` if `.git` exists):
   ```bash
   git init -b main
   git add -A
   git commit -m "GHG Town 3D v0.9"
   gh repo create <name> --public --source=. --remote=origin --push   # or --private if he chose that
   ```
4. **Enable Pages with GitHub Actions as the source**:
   ```bash
   OWNER=$(gh api user -q .login)
   gh api -X POST "repos/$OWNER/<name>/pages" -f build_type=workflow \
     || gh api -X PUT "repos/$OWNER/<name>/pages" -f build_type=workflow
   ```
5. **Deploy**. The push in step 3 already started the workflow; on a brand-new repo that first run fails (at "Configure Pages" or "Deploy") because Pages was not enabled yet — expected. Run it again and watch:
   ```bash
   gh workflow run deploy-pages.yml --ref main
   sleep 8
   gh run watch "$(gh run list --workflow deploy-pages.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
   ```
6. **Get and check the URL**:
   ```bash
   URL=$(gh api "repos/$OWNER/<name>/pages" -q .html_url)   # usually https://OWNER.github.io/<name>/
   curl -sI "$URL" | head -1; curl -sI "${URL}js/app.js" | head -1; curl -sI "${URL}assets/owl.webp" | head -1
   ```
   All should be `200`. A 404 in the first minute or two is normal; wait and retry.
7. **Finishing touches** (then commit and push again, which redeploys):
   - `README.md`: replace the "เล่นออนไลน์" placeholder with the real URL.
   - `index.html`: make the preview absolute so LINE/Facebook show the cover — `og:image` → `${URL}assets/og-cover.jpg`, and add `<meta property="og:url" content="${URL}">`.
   - `gh repo edit --homepage "$URL" --description "GHG Town 3D · เมืองคาร์บอน — เมืองจำลอง 3 มิติสำหรับอบรมการทวนสอบคาร์บอนฟุตพริ้นท์องค์กร (CFO)"`
8. **Report** (Thai): the URL, that every push to `main` redeploys in about a minute, and how to ask for content changes.

## Everyday changes

- Text, questions, options, answers, EF/GWP numbers, riddles → `js/content.js`. Check syntax with `node --check js/content.js`, preview locally, commit, push.
- UI or 3D behaviour → edit `src/…`, `npm run build`, preview, commit sources **and** generated files, push.
- The user is the subject-matter expert: do not change facts in `content.js` (EF values, GWPs, correct answers, scope categories) unless he asks; if something looks wrong, ask him.
- Each stop in `content.js` has `opts` and `ans` (index of the correct option). The UI hides a gas or scope chip until the stop is answered when the correct option names a gas or "ประเภทที่ N" — keep titles (`title`, `short`) from naming the answer.

## Verify after any change

1. `npm run serve`, open <http://localhost:8080/>, DevTools console: no errors, no 404s.
2. "เริ่มสำรวจเมือง" → "เข้าเมืองเลย" → walk with W A S D → find a "?" → E → aim (or click the source) → answer a question.
3. "ทัวร์นำเที่ยว" mode reaches stop 1 and shows its question card.
4. "เดินทางด่วน" lands next to a riddle; reload the page → the intro offers "เล่นต่อจากเดิม" with the same score.
5. At phone width (375 px) the top bar does not overlap and the minimap is visible.
6. First arrival at an unsolved stop plays the site-visit film (letterbox, AR tag, subtitles); "ข้ามวิดีโอ" / Space skips it; the card then shows the evidence photo and "ดูวิดีโอสำรวจอีกครั้ง" replays it.

## Troubleshooting

- Workflow fails at **Configure Pages** or **Deploy** with "Not Found" / "Get Pages site failed" → Pages not enabled: step 4, then rerun.
- Pages unavailable for a **private** repo on a free plan → after asking him: `gh repo edit --visibility public --accept-visibility-change-consequences`.
- An action reported as deprecated → bump its major version in the workflow (currently checkout@v6, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5, all on Node 24).
- Fonts look different offline: Prompt / IBM Plex Sans Thai come from Google Fonts; without internet the system Thai font is used. That is fine.
- No "เสียงบรรยายภาษาไทย" switch in the menu: the device has no Thai speech voice (Windows needs the Thai language pack; Edge's online Natural voices work). Everything else still works.

## Don't

- Don't hand-edit generated files, reformat `js/content.js`, upgrade three.js, or add frameworks/bundlers.
- Don't commit `node_modules/` or `build/` (already in `.gitignore`).
- Don't force-push, rewrite history, or delete the repository.
