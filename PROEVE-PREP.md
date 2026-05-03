# Prøve-prep weekend (FP9 mandag 4. maj 2026)

> **For nye Claude-sessions:** start her. Læs hele dokumentet. Du arbejder i en kort, presset sprint, ikke et langsigtet projekt. Kvalitet > omfang. Spørg før du udvider scope. Pluk-op-fra-status-sektionen herunder for at vide hvor vi er.

Akut arbejdsdokument. Eleverne har FP9 Matematik på mandag. Vi bygger træningsapp i weekenden så de kan øve på telefon. Live på `https://jbmnapps.github.io/mat/`.

Branch: `weekend`. `main` står urørt.

---

## Status nu (opdateres efter hver session)

**Sidst opdateret:** 2026-05-03, nat (efter share-iteration + audit, før Supabase-merge)

**Live:** https://jbmnapps.github.io/mat/share/ — det er det eleverne bruger.

### Hvad er bygget

**Indhold (uændret):** 13 discipliner × 12 opgaver = 156 opgaver. Alle 156 svar er manuelt verificeret korrekte (jf. opgaver-audit). Tal & algebra (7 disciplines), Geometri (3), Statistik (3). Mangler stadig: vinkler, ligedannethed, overslagsregning, regneudtryk, decimaltal-opgaver.

**Bonus-indhold:** Gangetabel-træner under `app/gangetabeller/` (separat side, ikke i opgavebank). Bygges aktivt af parallel session.

**Iteration på /share/ siden 2026-05-02:**
- **Round 1+2:** forside-cleanup, addition-tips simpler, layout-shift fix på elever-opgaven, typo i import, status synlig på mobil, smooth feedback-animation
- **Round 3a:** titel-ombrydning på mobil, hover-effekter "klistrer" ikke længere på iOS, tap-highlight væk
- **Round 3b:** Lektion responsivt grid (clamp), eksplicit "Tjek"-knap til iOS numeric keypad, disciplin-side mode-cards centreret vertikalt, prøveklar-kort greyet ud, ny prøveklar-tekst
- **Round 3c:** Frem/tilbage-navigation i træning (← knap + ←/→ tastatur), PWA fullscreen via appleWebApp metadata
- **Round 3d:** Keyboard-scroll fix (`h-[100dvh] overflow-hidden`)

**System-fasen:**
- `SMAG.md` — levende dokument over brugerens smag/sprog/regler. Vokser med hver iteration.
- 4 custom subagents under `.claude/agents/`: visual-reviewer, forklaringer-reviewer, opgaver-reviewer, ux-reviewer. Bruges proaktivt før push.
- `CLAUDE.md` har hardcoded regel: ingen UI/indhold-ændringer uden at have læst SMAG.md først.

### Audit kørt (2026-05-03)

3 parallelle agent-audits dækkede forklaringer, opgaver, og visual+UX. Resultater synteseret i **[AUDIT.md](AUDIT.md)** med prioriteret fix-liste. **Læs AUDIT.md før næste arbejdssession.**

**TL;DR fra audit:**
- 🔥 1 kritisk regression: state-bug i Quiz hvor forrige feedback hænger ved på næste opgave (introduceret af min frem/tilbage-implementering — fix er beskrevet i AUDIT.md sektion 1.1)
- 🔥 SMAG-overtrædelser: sub-03/sub-05 bruger forbudt jargon ("tier-søjle"), mul-05 har faktuelt forkert tip
- ⚠️ 16 forklaringer afslører eller næsten-afslører svaret (især `sandsynlighed.ts` — 7 af 10)
- ⚠️ Mangler dækning af kendte Ismail-svagheder (lig: x på begge sider, koo: negativ koordinat)
- ✅ 156 svar matematisk korrekte, design-niveau er på "Pro"

### Næste session — handoff-instruktioner

Læs i denne rækkefølge:
1. Denne fil (PROEVE-PREP.md) — projektoverblik
2. **[AUDIT.md](AUDIT.md)** — den prioriterede fix-liste fra audit
3. [SMAG.md](SMAG.md) — brugerens smag og regler (HARD krav før UI/indhold-ændringer)
4. [CLAUDE.md](CLAUDE.md) — projekt-instruktioner
5. [BACKEND-TJEK.md](BACKEND-TJEK.md) — kun ved Supabase-arbejde

**Anbefalet rækkefølge for fix:**
1. Prioritet 1 fra AUDIT.md (kritisk state-bug + SMAG-violations) — ~30-45 min
2. Verifér via visual-reviewer-agenten
3. Prioritet 2 forklaringer (sandsynlighed-omskrivning + 8 specifikke) — ~45-60 min
4. Verifér via forklaringer-reviewer-agenten
5. Tilføj manglende Ismail-dækning til lig + koo — ~20 min
6. Visuel polish — ~20-30 min
7. Tilføj 5 nye principper til SMAG.md
8. Build + deploy til /share/

**Total estimat: 2-3 timer.**

### Branch-strategi efter denne session

- `weekend-share` → mergeret til `weekend` (denne sessions arbejde)
- `weekend-supabase` → Supabase-session merger ind i `weekend` når deres tests er grønne
- `gh-pages` → manuel deploy til `/share/` ved hver share-iteration; auto-deploy til `/mat/` ved push til weekend
- Cleanup af stale `claude/`-worktrees: ikke gjort i denne session — gemt til efter prøven

### Kendte begrænsninger

- Kun lektion bygget for addition (premium-stil). Andre discipliner viser "Lektion kommer snart".
- Prøveklar-mode endnu ikke bygget (træning bruger samme metode `registrérPrøveklarForsoeg` for at status vises på dashboard — splittes når prøveklar kommer).
- Koordinatsystem-opgaver er rent tekstuelle. Visualiseringer kræver eget format.

**Vigtigste arbejds-løkke:**
1. Lav ændring → kald relevant subagent (visual / forklaringer / opgaver / ux) → fix evt. ❌
2. Push til `weekend-share` (eller relevant branch) → manuel build + deploy til `/share/` for share-side
3. Eller: merge til `weekend` → GitHub Actions auto-deployer til `/mat/`

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
