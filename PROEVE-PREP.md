# Prøve-prep weekend (FP9 mandag 4. maj 2026)

> **For nye Claude-sessions:** start her. Læs hele dokumentet. Du arbejder i en kort, presset sprint, ikke et langsigtet projekt. Kvalitet > omfang. Spørg før du udvider scope. Pluk-op-fra-status-sektionen herunder for at vide hvor vi er.

Akut arbejdsdokument. Eleverne har FP9 Matematik på mandag. Vi bygger træningsapp i weekenden så de kan øve på telefon. Live på `https://jbmnapps.github.io/mat/`.

Branch: `weekend`. `main` står urørt.

---

## Status nu (opdateres efter hver session)

**Sidst opdateret:** 2026-05-03, søndag morgen — efter samling af share + supabase-session i weekend-branch.

**Live:** https://jbmnapps.github.io/mat/ — det eleverne bruger. (Den gamle `/share/`-snapshot eksisterer stadig på samme URL men er ikke længere det vi peger på.)

**Branches:** `weekend-share` og `weekend-supabase` er begge merget til `weekend`. Sprintet er afsluttet — én aktiv branch fremadrettet.

### Hvad er bygget

**Indhold:** 13 disciplinerne × 12 opgaver = 156 opgaver. 156 svar verificeret korrekte (opgaver-audit). Tal & algebra (7), Geometri (3), Statistik (3). Mangler: vinkler, ligedannethed, overslagsregning, regneudtryk, decimaltal-opgaver.

**Bonus-indhold:** Gangetabel-træner under `/gangetabeller/` (separat side, ligger på gh-pages, peget på fra footeren).

**Login + sync + lærer-side (Supabase-session):**
- Login med navn + 4-cifret kode (syntetisk email under motorhjelmen)
- Premium login-overlay over blurred dashboard (ikke separat /login/-side)
- Hard gate på `/` og `/[disciplin]/*` — ingen adgang uden login
- Lærer-side på `/laerer/<token>/` (hvor token = `NEXT_PUBLIC_LAERER_TOKEN`)
- Sync: localStorage primær, Supabase mirror. Max-best-score-merge ved login
- Aktivitetstid-tracker (kun synlig for læreren)
- Live-aktivitet på lærer-siden ("Aktiv nu" + auto-refresh hver 30s)
- Lærer kan reset progress pr. elev i UI; reset-kode linker til Supabase-dashboard
- Cached auth-state for snappy navigation (ingen spinner mellem sider)

**PWA-installation:**
- `app/manifest.ts` + appleWebApp metadata + ikoner i `public/`
- Brugerdesignet ikon (grønt smiley med × og ÷ som øjne) i `assets/icon-source.png`
- Eleven kan tilføje appen til hjemmeskærmen og åbne i fuldskærm uden browser-bar

**Træningssekvens:**
- `TRÆNINGS_TRIN` i `lib/disciplines.ts` — 4 trin baseret på FP9-prøveanalyse (procent/forhold → regnesikkerhed → statistik → geometri)
- "Næste op:"-card på dashboardet peger på første ikke-grønne disciplin i sekvensen
- "Du er klar"-card når alt er grønt

**iOS-polish (share-session):**
- Keyboard-scroll fix (`h-[100dvh]` + `overflow-hidden`) på Quiz og Lektion
- Frem/tilbage-navigation i træning (← knap + tastatur)
- Hover-styles "klistrer" ikke længere på iOS efter tap
- Tap-highlight væk; titler ombrydes pænt
- Lektion responsivt grid med clamp; "Tjek"-knap til iOS numeric keypad

**System / kvalitet:**
- `SMAG.md` — levende dokument over brugerens smag/sprog/regler
- 4 custom subagents (`.claude/agents/`): visual-reviewer, forklaringer-reviewer, opgaver-reviewer, ux-reviewer
- `CLAUDE.md` hardcoded regel: ingen UI/indhold-ændringer uden at have læst SMAG.md
- Security advisor: 0 errors, 1 warning (Leaked Password Protection — Pro-only, bevidst ignoreret)

### Backend-state (Supabase)

**Tabeller (i `public`-skema):**
- `students` — id (= auth.users.id), name_slug, display_name, created_at, last_active, total_active_seconds
- `progress` — student_id, discipline_id, status, best_score, attempts, last_attempt, history, updated_at

**RLS:** aktiveret på begge tabeller. Eleven kan kun se/ændre sin egen række. Læreren (`laerer@fp9.local`) kan se alle og slette progress-rækker.

**Functions:**
- `add_active_seconds(seconds)` — atomic increment af `total_active_seconds`. SECURITY INVOKER, capped på 600/kald.
- `touch_last_active()` trigger på `progress` — opdaterer `students.last_active`.

**Setup-steps gennemført:** SQL kørt, "Confirm email" slået fra, GitHub Secrets tilføjet (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_LAERER_TOKEN). Testet end-to-end. Alt live.

### Audit (2026-05-03, før supabase-merge)

3 parallelle agent-audits dækkede forklaringer, opgaver, og visual+UX. Resultater i **[AUDIT.md](AUDIT.md)**.

**TL;DR — IKKE adresseret endnu:**
- 🔥 SMAG-overtrædelser: sub-03/sub-05 bruger forbudt jargon ("tier-søjle"), mul-05 har faktuelt forkert tip
- ⚠️ 16 forklaringer afslører eller næsten-afslører svaret (især `sandsynlighed.ts` — 7 af 10)
- ⚠️ Mangler dækning af kendte Ismail-svagheder (lig: x på begge sider, koo: negativ koordinat)
- ✅ 156 svar matematisk korrekte, design-niveau er "Pro"
- Note: Den state-bug i Quiz fra audit-filen blev fixet af share-session før merge.

### Næste session — handoff-instruktioner

Læs i denne rækkefølge:
1. Denne fil (PROEVE-PREP.md) — projektoverblik
2. [AUDIT.md](AUDIT.md) — prioriteret fix-liste (ikke-adresseret)
3. [SMAG.md](SMAG.md) — brugerens smag og regler (HARD krav før UI/indhold-ændringer)
4. [CLAUDE.md](CLAUDE.md) — projekt-instruktioner
5. [BACKEND-TJEK.md](BACKEND-TJEK.md) — kun ved Supabase-arbejde
6. [SUPABASE-SETUP.md](SUPABASE-SETUP.md) — kun hvis du nulstiller Supabase

**Anbefalet rækkefølge før prøven (mandag 4. maj):**
1. Test ende-til-ende på rigtig telefon: login, træning, PWA-install, offline-mode
2. AUDIT.md prioritet 1+2 (forklaringer der afslører svar; SMAG-overtrædelser) — ~1-1.5t
3. Tøm test-elever fra Supabase lige før linket sendes til klassen — `delete from auth.users where email like '%@elev.fp9.local';` (cascader)
4. Send link + instruktion til klassen

**Tid investeret hidtil:** ~5-6 timer aktivt + ~2t opgave-bygning. Total ~8t.

### Branch-status

- `weekend` → live på `/mat/`. Indeholder share + supabase samlet.
- `weekend-share` → afsluttet, kan slettes efter mandag (eller bevares som historik).
- `weekend-supabase` → afsluttet, kan slettes efter mandag.
- `main` → urørt. Cherry-pick efter prøven.
- `gh-pages` → auto-deploy fra weekend + bevarede manuelle filer (`/share/`, `/gangetabeller/`).

### Kendte begrænsninger

- Kun lektion bygget for addition (premium-stil). Andre disciplinerne viser "Lektion kommer snart".
- Prøveklar-mode endnu ikke bygget. Træning bruger `registrérPrøveklarForsoeg` så status vises på dashboard.
- Koordinatsystem-opgaver er rent tekstuelle. Visualiseringer kræver eget format.
- Lærer-tokenen ligger i public bundle (det er meningen — sikkerheden er på unik værdi, ikke skjult). Hvis lækket: regenerer 32 hex-tegn → opdater `.env.local` + GitHub Secret + redeploy.

**Vigtigste arbejds-løkke:**
1. Lav ændring → kald relevant subagent (visual / forklaringer / opgaver / ux) → fix evt. ❌
2. Push til `weekend` → GitHub Actions auto-deployer til `/mat/` på ~2 min
3. Test live i incognito (eksisterende session forvirrer)

---

## Code-map

```
app/
  layout.tsx                    Root HTML + chunk-cache-auto-reload script
  page.tsx                      Dashboard (alle 18 discipliner grupperet)
  [disciplin]/
    layout.tsx                  generateStaticParams for alle 18
    page.tsx                    Disciplin-side med 3 mode-kort
    lektion/page.tsx            Switcher → premium-lektion eller "kommer snart"
    traening/page.tsx           Træning — bruger Quiz-komponent

components/
  quiz.tsx                      ⭐ Quiz-engine. Numeric + MC. Lærer-skip.
  mode-card.tsx                 Lektion/Træning/Prøveklar-kort
  discipline-card.tsx           Disciplin-kort på dashboard
  save-actions.tsx              Eksport/import + navn-input
  lektion/
    addition-interactive.tsx    Premium-lektion (kun addition pt.)

lib/
  disciplines.ts                Master-liste over 18 discipliner
  quiz-types.ts                 Opgave-typer (numeric, multiple-choice)
  store.ts                      Zustand + localStorage-persistens
  use-hydrated.ts               Hook for SSR-safe progress-visning
  content-registry.ts           ⭐ Hvilken mode er bygget pr. disciplin
  opgaver/
    index.ts                    ⭐ Opgave-registry (per-disciplin map)
    addition.ts, subtraktion.ts, ...   Opgave-bank pr. disciplin (12 stk)
```

⭐ = filer der røres når du tilføjer en ny disciplin med opgaver.

## Common operations

### Tilføj opgaver til en disciplin der ikke har dem endnu

1. Lav `lib/opgaver/<disciplin-id>.ts` (kopiér struktur fra `addition.ts`).
2. I `lib/opgaver/index.ts`: import + entry i `OPGAVER`-map.
3. I `lib/content-registry.ts`: tilføj `'traening'` til `INDHOLD[disciplin-id]`.
4. `npx tsc --noEmit` for at verificere.
5. `git commit + push` → ~2 min senere live.

Disciplin-knappen på dashboard og træning-routen er allerede pre-rendret for alle 18 — du behøver ikke ændre routes.

### Verificér deploy uden gh CLI

```bash
curl -s "https://api.github.com/repos/jbmnapps/mat/actions/runs?branch=weekend&per_page=1" \
  | python3 -c "import json,sys; r=json.load(sys.stdin)['workflow_runs'][0]; print(f\"{r['status']} / {r['conclusion']}\")"
```

### Self-check UI-ændring før push

```bash
npm run dev   # lokal på :3000
# eller hvis ændring er pushet:
# brug Claude in Chrome til at navigere til https://jbmnapps.github.io/mat/...
```

### Delegér QC af opgave-bølge

Brug `Agent` med `general-purpose`-subagent. Send filer-listen og specifik checkliste (korrekthed, hint-stil, distraktorer, tone). Eksempel-prompt findes i tidligere sessioner — typisk format: ✅/⚠️/❌ pr. opgave-id.

### Build lokalt med produktions-basePath

```bash
NEXT_PUBLIC_BASE_PATH=/mat npm run build
```

Uden env-var bygges til root (for local dev).

---

## Plan

### Bølge 1 — Live i dag (færdig undtagen deploy-godkendelse)
- Quiz-engine (numeric + multiple choice + feedback)
- Træning-route med 12 addition-opgaver
- GitHub repo + Actions deploy + branch-strategi
- ⏳ Bruger aktiverer GitHub Pages → første live URL

### Bølge 2 — Resten af regnearter (~45 min)
- Subtraktion: 12 opgaver (mente, lån, ord-opgaver)
- Multiplikation: 12 opgaver (gangetabeller, 2-cifret, ord)
- Division: 12 opgaver (simpel, med rest, ord)
- Bruger reviewer i browser, ikke i chat

### Bølge 3 — Resten af tal-og-algebra (~90 min)
- Procent (rabat, stigning, "X% af Y")
- Procent/brøk-omregning
- Ligninger (`x + 5 = 12`, `2x = 14`)
- Hverdagsregning (priser, mængder, blandet)

### Bølge 4 — Geometri (~75 min)
- Enhedsomregning (m↔km, cm↔mm, dL↔mL)
- Rumfang og areal (rektangel, trekant, kasse)
- Koordinatsystem (aflæs punkter, simple ligninger)

### Bølge 5 — Statistik og sandsynlighed (~60 min)
- Tabeller og gennemsnit
- Diagrammer (aflæs søjle/linje)
- Sandsynlighed (terning, mønt, simpel kombinatorik)

### Bølge 6 — Backend (~75 min)
- Supabase: simpel users-tabel (brugernavn + 4-cifret kode)
- Progress synces fra localStorage → Supabase
- Lærer får admin-adgang til at se elev-status

### Bølge 7 — Hvis tid
- "Prøveklar"-mode (samme engine, tidstaget, blandet pulje, gemmer i historik separat fra træning)
- "Med hjælpemidler"-mode (opgavetekst + tekstfelt til fremgangsmåde + svar + facit-knap)
- 1 ekstra premium-lektion (sandsynligvis procent eller ligninger)
- Letvægts-lektioner for resten (statisk side med worked example)

---

## Beslutninger

### Scope og prioritering
- Vi rammer 80% af FP9-pointene ved at dække tal + geometri + statistik på træningsniveau, ikke 100% kvalitet på alle modes.
- Letvægts-lektioner først hvis tid. Premium-lektion (som addition) er ikke kritisk vej.
- "Med hjælpemidler"-mode skippes til bølge 7.

### Quiz-format
- Kun numeric input og multiple choice. Ingen drag-and-drop, ingen mente-placering i quiz.
- Mente og opstilling forbliver kun i lektionen (addition har det; andre kan få det i bølge 7).
- 12-15 opgaver per disciplin. Ikke 50.
- FP9-tone: "Udregn", knappe beskeder, navne OK i word-problems.
- Forklaringer kun på opgaver hvor der er en trick (mente, overslag, finte). Ikke på alle.

### Indhold
- Decimaltal er en separat disciplin — ikke blandet ind i addition.
- Bruger reviewer opgaver i browser fra og med bølge 2 (ikke i chat).
- Hvis bruger retter en opgave i browser, sender hen diff'en eller bare "ret X til Y".

### Status og progress (bølge 1)
- Træning kalder samme metode som prøveklar (`registrérPrøveklarForsoeg`) for at status opdateres synligt på dashboard. Splittes når prøveklar-mode bygges (bølge 7).
- localStorage i bølge 1–5. Supabase i bølge 6.

### Repo og deploy
- `main` = langsigtet projekt, urørt fra nu af.
- `weekend` = iteration de næste 2–3 dage. Deploy fra denne.
- Cherry-pick til main efter mandag.
- URL: `https://jbmnapps.github.io/mat/` (basePath `/mat` via env var, så local dev stadig kører på root).
- `.gitignore` ekskluderer Claude-skills, build-artefakter og copyrighted FP9-PDF'er.

### Workflow
- Push til `weekend` → GitHub Actions bygger og deployer → ~2 min senere er det live.
- Bruger tjekker live-URL og giver feedback i chat eller via "ret X til Y"-beskeder.
- Vi skipper PR'er på weekend-branch — alt går direkte. Hvis vi vil have changes til main, sker det efter mandag som en samlet cherry-pick.
