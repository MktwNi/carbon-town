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
| Engine source | `src/engine/*.js` | 17 modules; concatenation order is `ENGINE_ORDER` in `src/tools/build.mjs` (v0.8 added `audio.js`, v1.0 `film.js`, v1.1 `warehouse.js` and `post.js`, v1.2 `plant.js` and `civic.js`; a new module must also go in the `MIXIN` list there). |
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
- Crowd LOD in `actors.js`: `p.lod` 2 = near (< 48 m since v1.1, `_acNearParts`: lofted bodies `_acLoftGeo`, faces `_acNFace`, skull-following hair `_acNHairCap`, styles in `p.hs`), 1 = light parts (medium-smooth `'mid'` kit since v1.1), 0 = rounded impostor beyond 110 m. Every crowd mesh carries `lod`.
- City: tree canopies `_wBlob` (welded lumpy spheres, baked shading), contact shading on grounded `box()` sides (`o.ao`, opt out with `noAO`), vehicle greenhouse `cabin()` in `_wVehGeo`.
- Smoothness: `core._loop` steps with the rAF timestamp and an eased `dtS`; shaders are pre-compiled at boot; `tune.js` lowers / restores the pixel ratio around ~48 fps; mouse look is queued in `E.lookQ` and eased in `_tickPlayer`.

v1.0 notes:
- Site-visit film (`film.js`): the first arrival at an unsolved stop (`_pArrive` and the found path in `_tickTour` call `_fmArrive`) plays a ~12 s clip before `eArrived` reaches the UI. Shots are planned from the anchor (`_fmPlan`: aerial arc on the viewpoint side, walk-in from `view` towards `look`, close-up orbit in open ground or a push-in among walls) and checked against the colliders. The UI shows it from `eFilm` / `eFilmShot`; per-frame HUD bits are written into the kept element `.ghg-fm-live` (`filmRef` → `_fmAttach`). Space / Esc skip (`_eFilmSkip`); the card replays it (`_eFilm`). The evidence photo is read right after the frame is drawn (`core._loop` → `_fmSnap` → UI `_uPhoto`, saved under the storage key + `:photos`).
- Gas puffs: one `type: 'gas'` emitter per gas per stop (none for scope 2), own particle pool `E.partsG`; pale while the gas is the answer (`E.gasHide`), the gas colour once solved.
- Question card: answer tabs are one segmented bar whose icons come from CSS masks (`.ghg-quiz-tabs>[data-k=...]`); the tab's mascot speaks in `.ghg-quiz-host` under it. `.ghg-quiz-more` is a size container: below 700 px the tabs stack icon-over-label. Avatars in the card use `pic(..., 1.22, { fy: 0 })` so heads are not clipped.
- Thai narration: UI `_uSay` (Web Speech API, best Thai voice via `_uTtsVoice`, `_uSayText` spells out formulas and units). It reads film cues (`_uFilmCue`), the speaking mascot's line and the question; the film holds its close-up while it is still speaking (`E.narrOn`). Menu switches: `filmAuto`, `narr` (saved with the progress).

v1.1 notes:
- Rice-mill warehouse bay (`warehouse.js`, called from `complexes._bMill`): `_whWindows` (south-wall windows: bright day panes inside, glass outside), `_whBuild` (epoxy floor, racks `_whRack`, goods `_whLoad` / `_whCarton` / `_whPallet`, conveyor `_whConveyor`, decals, contact shadows) and `_whForkliftRun` (stop 10's diesel forklift and its cycle; the exhaust emitter is what the film tracks). Canvas textures and buckets (`whCarton`, `whWood`, `whRack`, `whPaint`, `whSack`, `whEpoxy`) are made once in `_whInit`; `_whFlush` merges the contact shadows and window light spill after the mill is built.
- Indoor light (`sky.js`): `E.spots` = two shadow-casting downlights placed on the interior lamps nearest the camera (their shadow maps only update while inside; skipped at the lowest quality step); inside, `E.inK` eases the hemisphere light and the environment (`E.envK`, rebuilt PMREM) down and the exposure up. Interior lamp lists (`_interior({ lights })`) drive both.
- Look ("realistic, a touch cartoon"): `core._boot` swaps three's `CustomToneMapping` for ACES + a little saturation / warmth / soft blacks (applies to every material, phones too). `post.js`: `core._loop` calls `_postRender` (frame to screen, then a full-size depth-only pass of opaque objects within 140 m, half-size AO + depth-aware blur, and a final pass multiplying AO and a light ink line on the near side of silhouettes, faded by 70 m). AO ignores steps under ~3.5 cm (tile joints) and off-screen samples. Transparent / sprite / alpha-tested objects are moved to layer 2 (`_postLayers`) so they stay out of the depth pass; shadow cameras also see layer 2. WebGL2 desktops only; `tune.js` turns it off at the two lowest steps.

v1.2 notes:
- Detailed plant rooms (`plant.js`): shared fittings `_plPipe` (clad pipe + flanges), `_plValve` (red handwheel), `_plGauge` (dial), buckets `plClad` (aluminium cladding) and `plConc` (stained concrete). `_plBoilerRoom` (called from `complexes._bMill`) builds stop 9's interior: steel-cased furnace with the open fire door (stop 9's look target, the fire flickers), clad boiler with mountings, steam header, feedwater tank / pumps / softeners, blowdown tank, control panel with screen, cable tray, louvers, signs. `_plGenRoom` (called from `complexes._bHospital`) does the same for stop 6: diesel genset on a skid (radiator with a spinning fan, engine with turbo and filters, alternator, controller screen, batteries), clad exhaust with bellows to the roof silencer and stack, switchboards with meters, day tank in a spill tray. Each room ends with `_plFlushDials(screenMat)`. Shared buckets also used elsewhere: `plGoods` (printed packaging, minimart products), `plBottle` (labelled drinks), `plLabN` / `plLabO` / `plLabL` (wrap-round N₂O, O₂ and LPG cylinder labels, stops 7 and 8); call `_plInit()` before using them.
- AO depth pass: meshes are drawn with cached depth twins (`_postTwin`: same side and polygon offset as their material), so floor layers a few mm apart (epoxy, stained concrete, paint over slabs) do not z-fight into stripes.
- AO strength is bounded per sample (cosine to the occluder, at most 1, squared fall-off over the radius) and `intensity` 2.3 averages over the 12 samples, so a 90° inside corner goes about half dark instead of black; this removed the soot-like streaks on walls next to columns and boards.
- Civic and utility stops (`civic.js`, `_cvInit()` first): `_cvSeptic` (stop 2, called from `world._wMunicipal`; lids are discs `cvDisc0..2` with the `cvLid` atlas), `_cvTransformer` (stop 3: tapered square poles `cvPole`, corrugated tank `cvFin`, drop-out cutouts `_cvCutout`, kWh meter decal), `_cvMotoShed` (stop 4: shed, survey board, parks the bikes and drops helmets), `_cvExtinguishers` with `_cvCO2` / `_cvDry` (stop 5), `_cvTipper` (stop 11, called from `complexes._bMill`; returns `{ g, bed, load, upd }` and the mill's animation calls `upd()` after tipping so the three-stage ram and the hanging tailgate follow), and for stop 12 `_cvBreakerPole` (SF₆ density monitor decal `dens`), `_cvMechBox`, `_cvSF6Cart` (cylinder on a platform scale) and `_cvPowerXfmr`. Decals (`meter`, `scale`, `dens`, `poster`, `paper`, `tag`, `fireBoard`, `plate`, `tplate`) go through `_cvDecal` and are flushed with `_cvFlush()` at the end of each site (it also flushes the plant gauge faces). `_cvDial` / `_plGauge` orient the bezel with `cylR(..., π/2, 0, -ry)`; three's XYZ Euler order means `(π/2, ry, 0)` would leave the bezel facing +z whatever `ry` is. Gravel bucket `cvGravel` covers the substation yard and the transformer pits.
- Vehicles: the shared motorbike (`_wVehGeo` `moto` / `motoP`, about 1,100 vertices) is an underbone with rims, fork, cowl, mirrors, rounded tail, exhaust and plate; there are about 216 parked ones in the city.

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
7. Inside the rice mill (stop 10): racks, conveyor and the forklift cycle (drive, lift, set the pallet on the east rack, back away); lamps cast shadows on the floor; no WebGL warnings in the console.

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
