# Plan — addition-lektion (lock-fasen)

> Aktivt arbejdsdokument. Slettes når addition-lektionen er låst.
>
> **Formål:** Lås principperne for hvad et godt lektion-modul (lag 1) er ved at få addition-lektionen rigtig først. Resten af disciplinerne replikeres derfra.
>
> Branch: `weekend-vision`. Eleverne ser intet før vi merger til `weekend`.

---

## Status

- 2026-05-03 søndag eftermiddag: gennemgang af nuværende `addition-interactive.tsx` lavet (Claude + brugeren). 20+ findings dokumenteret. 7 nye regler tilføjet til `TRAENINGSMODUL-RUBRIK.md`.
- Næste skridt: Fase 2 (visuelle og strukturelle bugs).

---

## Fase 2 — Visuelle og strukturelle bugs

Mål: lektionen skal *føles pro*. Ingen koncept-redesign — kun fix af det der er åbenlyst forkert.

### Tasks

- [ ] **Fjern fantom-kolonne 3-streg** (regel: layout må aldrig hint udfyldning). Grid skal kun vise søjler der faktisk skal bruges. POS-grid'et i `addition-interactive.tsx` ~line 401 skal opdateres til at være variable-bredde, ikke fixed 5-søjlet.
- [ ] **"14" må ikke crammes på 1 plads** (din desktop-10). Når svar er 2-cifret over en 1-cifret position, skal det enten fordele sig over to pladser eller udvide grid'et.
- [ ] **Klik-overalt-for-at-avancere** (regel: klik avancerer overalt). Tilføj baggrunds-klik-flade i avance-faser (alle ikke-input-faser). Behold Enter-handler.
- [ ] **"Tryk her" hint forsvinder efter brug** (din mobil-2). Hint skal være subtil, men ikke vedvarende klistret nederst når eleven klikker.
- [ ] **Beskeder ude af sync med scenen** (mit fund 2). `beskedFor()` returnerer ny tekst med det samme, men AnimatePresence's exit-animation (200-300ms) gør at gammel besked stadig vises. Mulige fix: kortere exit, eller cross-fade i stedet for fade-out-fade-in.
- [ ] **Tilbage-knap i animationen** (regel: navigation frem/tilbage). Pile-knap i header. Bagud bevarer fase-state. Frem genoptager.
- [ ] **Lille streg under 67+78 i første sekund** (din mobil-8). Sandsynligvis en grid-overgangsfejl. Find og fix.
- [ ] **Beskeder for lyse / faded** (mit fund 5). Tjek om `text-slate-900` faktisk renderes som det. Hvis opacity-animation ikke når 100%, fix.
- [ ] **Tekst-størrelse på "Her er et plusstykke" på mobil** (din mobil-1). Reducer max clamp fra 48px til ~36-40px.

### Verifikation

Efter Fase 2:
- Køre `traeningsmodul-reviewer`-agenten på modulet
- Køre `visual-reviewer`-agenten i 375x812 (iPhone) og 1280x800 (desktop)
- Manuel walkthrough igen — lektionen skal føles pro

---

## Fase 3 — Mente-momentet redesign

Mål: gør det centrale lærings-moment visuelt. "Vis, vis ikke fortæl"-reglen i praksis.

### Tasks

- [ ] **15-splittes-synligt-animation** når enerne giver 15. 15 vises som tal, splittes i "5 ned" og "1 op" som to bevægelige elementer. Ikke poof, ikke teleportér.
- [ ] **Eleven SKAL aktivt skrive mente-tallet 1** (din desktop-8). Når 15 splittes, åbner et lille felt over 6'eren hvor eleven taster 1. Ikke acceptere "5" som genvej.
- [ ] **Røde pile/markører ved "1+6+7"** (din desktop-9). Tre pile peger på de tre tal og samles. Visualiserer at de tre tal lægges sammen.
- [ ] **"1+6+7" formulering** (ikke "6+7+1") — reflekterer faktisk tankegang efter mente er på toppen.
- [ ] **Forkert svar → animeret forklaring + "prøv igen"** (regel: forkert svar). Når 15 svares forkert, animér tieren der flytter, vis hvorfor, lad eleven prøve igen.

### Verifikation

Efter Fase 3:
- `traeningsmodul-reviewer`-agent + brugeren tester live
- Ikke godt nok-filter: er det centrale lærings-moment nu *visuelt*? Hvis ikke, redesign igen.

---

## Fase 4 — Lektion-til-træning-broen

Mål: lektionen ender ikke med "du har lært det" — den fortsætter ind i progressiv træning.

**Dette er et nyt design, ikke et fix. Tackles som separat session efter Fase 3 er låst.**

### Skitse (skal udfyldes når vi når dertil)

- Efter mente-undervisning + fejr-2: "Du har set hvordan. Prøv selv 5 stk."
- 5 lette 2-cifret-stykker (samme stil som lektionen). Eleven løser uden hjælp.
- Tilbud: 5 mere eller "Klar til 3-cifret?"
- 5 stk 3-cifret.
- Til sidst: 1-2 FP9-lign opgaver med visualiseret problem-til-svar-flow ("Sara har 247 kr. Hun bruger 89 kr. Hvor mange har hun tilbage?" → opstilling → svar).
- Hele forløbet er ÉN sammenhængende flow. Ingen "afslut lektion → start træning"-overgang.

---

## Hvad vi IKKE gør i denne lock-runde

- Ikke generaliserer shellen (refactor venter til vi har 2+ lektioner).
- Ikke begynder på andre disciplinerne. Fokus 100% addition.
- Ikke rører eksisterende quiz-banker (`lib/opgaver/*.ts`) — de er lag 2-baseline.
- Ikke ændrer Supabase eller progress-data-shape.

---

## Live-site beskyttelse

Alt arbejde sker på `weekend-vision`. Eleverne på `/mat/` ser ingenting før brugeren bekræfter at fasen er færdig + ikke-brydende, og vi merger til `weekend`. Aldrig push direkte til `weekend` mens vi er på `weekend-vision`.

---

## Handoff-instruktion til ny session

Hvis denne plan tages op i ny session:

1. Læs `CLAUDE.md`, `PROEVE-PREP.md`, `TRAENINGSMODUL-RUBRIK.md`, denne fil — i den rækkefølge.
2. Tjek `git branch --show-current` — skal være `weekend-vision`. Hvis ikke, switch.
3. Tag næste ikke-checkede task ovenfor. Foreslå brugeren hvilken og start.
4. Efter hver task: opdater check-listen, kør relevant reviewer-agent, push til `weekend-vision` (ikke weekend).
5. Når alle Fase 2 + 3 tasks er ✅: bed brugeren bekræfte, merge til `weekend`, slet denne fil.
