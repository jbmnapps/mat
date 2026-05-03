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

## Status nu (2026-05-03 søndag eftermiddag)

**Live for eleverne:** Den gamle quiz-version (12 spørgsmål pr. disciplin
for 13 disciplinerne). Eleverne kan teste sig selv. Det er IKKE den vision
vi bygger mod — men det er funktionelt og nok som "hvor står jeg?"-værktøj
indtil det nye er klart.

**Brugeren sender link til klassen kl. ~18:00 i dag** med det vi har.
Mens de øver, bygger vi første nye modul.

### Hvad er bygget (gamle quiz-model)

- 13 disciplinerne med 12 quiz-opgaver hver = 156 opgaver, svar verificeret
- 1 lektion (addition) i den nye interaktive stil — er prototypen for resten
- Login (navn + 4-cifret kode), Supabase-sync, lærer-side, PWA-installation
- 4 custom subagents til kvalitetskontrol

### Hvad er IKKE bygget (men hører i den nye model)

- Lektion-træning for 12 ud af 13 disciplinerne
- Terpe-opgaver med variant-valg (alle nuværende quiz blandes på tværs)
- FP9-replika
- Bro-princippet i opgavebanker (de er progressive, men ikke broede)

---

## Næste skridt (resten af søndag aften + nat hvis lyst)

1. ✅ Doc-ryd-op (denne pivot) — *færdig kl. ~15:30 søndag*
2. ⏳ Læs `addition-interactive.tsx` sammen og vurdér om den skal generaliseres før vi laver disciplin #2
3. ⏳ Vælg første nye disciplin — kandidater: addition (færdiggør prototype) eller procent (vægter tungest på FP9)
4. ⏳ Byg lag 1 (lektion-træning) for valgt disciplin. Iterér én sektion ad gangen — hver retning fra brugeren oversættes til regel i `TRAENINGSMODUL-RUBRIK.md`
5. ⏳ Når den første discipline er solid: byg lag 2 + 3 for samme, ELLER replikér lag 1 til næste discipline. Brugeren beslutter.

**Realistisk forventning:** 1 disciplin fuldt færdig før mandag morgen er
ambitiøst men muligt hvis vi holder fokus.

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

## Branches

- `weekend` → live på `/mat/`. Aktiv arbejdsbranch.
- `main` → urørt. Cherry-pick efter prøven.
- `gh-pages` → auto-deploy fra `weekend`.
- Worktree-branches (`weekend-<task>`) opstår dynamisk når vi kører parallel.
