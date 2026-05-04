# Prøve-prep — FP9 Matematik (mandag 4. maj 2026)

> Aktivt arbejdsdokument. Læs FØRST i enhver session.
>
> Vi pivoterede 2026-05-03 søndag eftermiddag. Det gamle dokument
> (quiz-modellen) ligger i `archive/PROEVE-PREP-pre-pivot.md` som historik.

Branch: `weekend`. `main` står urørt. Live: <https://jbmnapps.github.io/mat/>.

---

## North Star

> **ALT i appen skal pege på at eleven lærer undervejs. Opgaver bygger
> færdigheder, terper dem, og bygger bro mellem sværhedsgrader — så
> effektivt som muligt.**

Hvis et stykke arbejde ikke peger den vej, er det enten af-prioriteret eller
forkert. Spørg før du udvider scope.

---

## 3-lag-modellen *(ny tilgang fra 2026-05-03)*

Hver disciplin får op til tre lag — i prioriteret rækkefølge:

1. **Lektion-træning** — interaktiv læringsoplevelse à la `addition-interactive.tsx`. Eleven lærer metoden ved at manipulere tal og se animationer.
2. **Terpe-opgaver** — isolerede øvelser pr. variant (fx "Addition · 3-cifre"). 10-12 ad gangen. Hint før svar. Bygger bro mellem sværhedsgrader.
3. **FP9-replika** — prøve-simulation pr. disciplin med markører for *"hvad du skal øve for at kunne det her"*.

Detaljerede krav i [TRAENINGSMODUL-RUBRIK.md](TRAENINGSMODUL-RUBRIK.md).

---

## Status nu (2026-05-03 søndag aften ~23:30)

**Live for eleverne:** Den gamle quiz-version på `/mat/`. Brugeren sendte
link til klassen ca. kl. 18 — eleverne kan teste sig selv mens vi bygger
videre. Den oprindelige addition-lektion var også med (men ikke det nye
modul vi har bygget i dag).

**Live for udvikling:** `/mat/test/` — auto-deployer fra `weekend-vision`-
branch. Det nye addition-modul kan testes der uden at påvirke eleverne.
Brugeren kan dele linket hvis han vil have feedback.

### Hvad er bygget i dag

**Doc-pivot (eftermiddag):**
- Arkiverede pre-pivot docs (PROEVE-PREP, AUDIT, SPRINT)
- 3-lag-model dokumenteret i ny TRAENINGSMODUL-RUBRIK.md
- 7 bærende regler udledt fra brugerens feedback
- North Star, focus-reminder, multi-session, live-site beskyttelse i CLAUDE.md
- Princip 4a "byg bro mellem sværhedsgrader" i PRINCIPPER.md
- Custom agent `traeningsmodul-reviewer` (erstatter `opgaver-reviewer`)
- Codex-filer samlet i `codex/`-mappe
- `/mat/test/` deploy-workflow tilsat

**Addition-lektion (aften — fase 2 af PLAN-ADDITION.md):**
- Fjernet fantom-kolonne 3-streg (regel: layout må aldrig hint udfyldning)
- Klik-overalt-avancerer i ikke-input-faser; klik på baggrund i input-fase
  re-fokuserer input
- Tilbage-knap i header med ArrowLeft tastatur-shortcut
- Math står stille når overskrift har flere linjer (bottom-anchored layout)
- Mente-undervisning sekventielt: tekst skifter → '1' lander → '5' lander
- Dynamisk math-grid (rows er 0px når unused) → math-højde matcher synligt indhold
- Addition-stregen er h-[2px] (matcher input-border)
- Intro→aktiv-overgang er smooth (var en motion-interpolations-bug — fixet
  med CSS-transition på transform)
- Animation-faldgruber dokumenteret i ANIMATIONER.md

### Hvad mangler

**Addition (fase 3-4):**
- Mente-momentet redesign (vis-vis-ikke-fortæl): 15 splittes synligt, eleven
  skriver mente-tallet, røde pile ved 1+6+7
- 4 kritiske UX-issues fra reviewet (se AUDIT.md): tilbage-knap forvirring,
  tilbage efter godkendt = sidder fast, forkert-svar uden besked, 5/15-
  tvetydighed
- Lektion-til-træning-broen (fase 4): efter "Du har lært det" → 5 stk 2-cifret
  → 5 stk 3-cifret → FP9-replika

**Andre disciplinerne:**
- Lektion-træning for 12 ud af 13 disciplinerne
- Terpe-opgaver med variant-valg
- FP9-replika
- Bro-princippet i opgavebanker

---

## Næste skridt (mandag morgen / før prøven)

1. ✅ Doc-ryd-op (pivot) — *færdig søndag eftermiddag*
2. ✅ Fase 2 af addition-lektion (visuelle og strukturelle bugs) — *færdig søndag aften*
3. ⏳ **Beslut: skal det nye addition-modul gå live?** Det ligger på `/mat/test/`.
   Hvis ja: merge `weekend-vision` → `weekend`, nyt modul deployer til `/mat/`.
   Hvis nej: eleverne fortsætter med original version til efter prøven.
4. ⏳ **Adressér 4 kritiske UX-issues** før merge (se AUDIT.md):
   - Tilbage-knap mental model (skjul i stedet for disable på første fase)
   - Tilbage efter godkendt svar = sidder fast (skal nulstille godkendt-flag)
   - Forkert svar = bare shake, ingen besked (tilføj prøv-igen-feedback)
   - 67+78 enere accepterer både 5 og 15 uden eksplicit besked
5. ⏳ Fase 3 (mente-redesign) er separat session. Se PLAN-ADDITION.md.
6. ⏳ Andre disciplinerne — efter prøven.

**Realistisk:** mandag morgen kl. 7-8 er sidste vindue til ændringer før
prøven. Hvis fase 3 ikke er færdig, kører eleverne med det vi har.

---

## Live-site beskyttelse

**Eleverne er på `/mat/` lige nu.** Hvert push til `weekend` deployer øjeblikkeligt.

**Arbejdsregel:**
- Vi arbejder på `weekend-vision`-branch (oprettes ved start af kode-arbejdet).
- Den deployer ikke automatisk. Push frit der.
- Kun når et modul er færdigt + verificeret + ikke-brydende, mergers det til `weekend` → live.

**Progress-preservation:**
- Datamodellen i localStorage og Supabase må aldrig brydes.
- Vi kan tilføje nye felter, men ikke omdøbe eller fjerne eksisterende.
- Hvis ny model kræver ny form: skriv migration først, kør ved app-start, aldrig wipe.

Hard rules + detaljer i [CLAUDE.md](CLAUDE.md) under "Live-site beskyttelse".

## Arkitektoniske beslutninger (2026-05-03 pivot)

- **Quiz-laget overlever som "terpe-opgaver" (lag 2)**, ikke som primær træning. Eksisterende `lib/opgaver/*.ts` bevares men skal opdeles i varianter pr. disciplin.
- **`components/lektion/addition-interactive.tsx` er mønstret** for lag 1. Skal måske generaliseres til genbrugelige byggeklodser.
- **`content-registry.ts` lyver pt.** — alle 13 disciplinerne markeret med `'traening'` selvom det reelt er quiz, ikke læringsmodul. Skal opdateres når lag 1 begynder at lande pr. disciplin.
- **"Greyed-out for ikke-klart"** håndhæves konsistent fra og med næste push (jf. `SMAG.md`).

---

## Læs disse filer (rækkefølge)

1. **CLAUDE.md** — projektmanual + samarbejdsmodel
2. **PROEVE-PREP.md** *(denne)* — status og plan
3. **TRAENINGSMODUL-RUBRIK.md** — krav til hvert lag, voksende rubrik
4. **PRINCIPPER.md** — pædagogiske principper (inkl. byg-bro)
5. **SMAG.md** — brugerens smag, sprog, regler — HARD krav før UI/indhold
6. **AUDIT.md** — eventuelle aktive findings
7. **BACKEND-TJEK.md** — kun ved Supabase-arbejde

Arkiverede docs ligger i `archive/`. Gamle versioner af denne fil og
quiz-pivot-AUDIT er der.

---

## Multi-session koordination

Hvis brugeren vil have to Claude-sessions samtidigt: hovedsessionen opretter
en `git worktree` i en separat mappe, sidesessionen åbnes der. Sidesessionen
må KUN pushe til sin egen branch — aldrig direkte til `weekend`. Brugeren
beder hovedsessionen flette ind. Detaljer i CLAUDE.md.

---

## Efter prøven — prio-liste

1. **Skill: "Byg ny lag-1-lektion"** *(første post-prøve-arbejde)*. Når addition-lektionen er låst, kapsel mønstret som en skill (via `/anthropic-skills:skill-creator`) der tager addition-interactive.tsx + TRAENINGSMODUL-RUBRIK.md som input og bootstrapper næste disciplin. Logikken: 12 disciplinerne tilbage — vi laver det rigtigt én gang i stedet for at gentage manuelt 12 gange.
2. Andre skills overvejes når mønstre dukker op (promover-til-weekend-checklist, terpe-opgave-variant-generator).
3. Sæt automatiske workflow-hooks op (type-check + lint efter Edit, pre-push reminder for reviewers).
4. Resterende disciplinerne: lektion-træning (lag 1), terpe-opgaver (lag 2), FP9-replika (lag 3).

---

## Branches

- `weekend` → live på `/mat/`. Aktiv arbejdsbranch.
- `main` → urørt. Cherry-pick efter prøven.
- `gh-pages` → auto-deploy fra `weekend`.
- Worktree-branches (`weekend-<task>`) opstår dynamisk når vi kører parallel.
