# Plan — addition-lektion (lock-fasen)

> Aktivt arbejdsdokument. Slettes når addition-lektionen er låst.
>
> **Formål:** Lås principperne for hvad et godt lektion-modul (lag 1) er ved at få addition-lektionen rigtig først. Resten af disciplinerne replikeres derfra.
>
> Branch: `weekend-vision`. Eleverne ser intet før vi merger til `weekend`.

---

## Status (opdateret 2026-05-04 mandag formiddag)

**Pivoteret strategi:** Vi skipper ikke længere "ship inden prøvedag". Eleverne kører på den gamle version på `/mat/`, det nye modul ligger på `/mat/test/` (auto-deploy fra `weekend-vision`). Nu spiller vi det lange spil: addition-lektionen skal være **fuldstændig perfekt** inden vi går videre, så er den et mønster der kan replikeres til subtraktion/multiplikation/division/osv.

- **Fase 2 låst** — alle visuelle og strukturelle bugs fixet søndag aften.
- **Forbedringer fra mandag** — se "Mandag-arbejde" nedenfor.
- **Mobil-tjek venter** — alt arbejde i dag har været desktop. Mobil testes når desktop er fuldt låst.
- **Fase 3 (mente-redesign) ikke startet.**
- **Live på `/mat/test/`**. Brugeren kan teste der.

### Hvad der virker nu
- Intro→aktiv-overgang: sekventiel anim (Regel 5 i ANIMATIONER.md)
- Klik-overalt avancerer i ikke-input-faser; klik på baggrund i input-fase re-fokuserer input
- Tilbage-knap i header (← knap + ArrowLeft tastatur-shortcut)
- **Stages-model for tilbage-navigation** (se nedenfor)
- **Forkert-svar-feedback**: "Prøv igen" i amber, 2 sek
- Math står stille når overskrift har flere linjer (bottom-anchored layout)
- Mente-undervisning sekventielt: tekst skifter → '1' lander → '5' lander
- Dynamisk math-grid (rows er 0px når unused) → math-højde matcher synligt indhold
- **Input-tal og statiske tal baseline-aligner** (padding-top på input, lg-variant tilføjet)
- **Overskrift-størrelse og gap harmoniseret** med stykket
- **Hint kun på intro-1** — passiv-aggressiv UI fjernet på alle andre faser

### Mandag-arbejde (2026-05-04)

1. **Tilbage-bugs fixet** (3a + 3b): godkendt-flag nulstilles når tilbage lander på input-fase; broen-morph springs over så timeren ikke kaster eleven frem igen.
2. **Stages-model**: Stage A (intro-1 → fejr-1) går fase-for-fase. Stage B (broen → færdig) hopper helt tilbage til vis-horisontal-1 og rydder ex1-state. Eliminerer en hel klasse af bugs.
3. **Animation-clash ved tilbage til intro**: stykke fader ud først (180ms), pause, så vokser/flytter overskrift. Reglen "sekventielt, ikke parallelt" tilføjet til `ANIMATIONER.md` som Regel 5.
4. **Forkert-svar-feedback**: "Prøv igen" i amber-600, 2 sekunder. Lukker AUDIT 🔥.
5. **Alignment-pass**: input-tals padding-top så det baseline-aligner med statiske tal. lg:h-[74px] lg:leading-[72px] tilføjet (text-7xl overflowede før). leading-none på top-tal (24, 54).
6. **Spacing/proportioner**: overskrift max 32px (var 28). Gap 24px (jf. brugerens "samme afstand som før det blev opstillet").
7. **Hint-placering**: under primært indhold (intro: under overskrift, aktiv: midt mellem stykke-bund og viewport-bund), så fjernet helt på alle ikke-intro faser.

### AUDIT-status efter mandagens arbejde
- ✅ Tilbage-knap mental model — adresseret via stages-model (skjuler ikke knap, men nu er der ingen state-fælde)
- ✅ Tilbage efter godkendt = sidder fast — fixet
- ✅ Forkert svar = bare shake — fixet med "Prøv igen"-besked
- ❌ 67+78 enere accepterer både 5 og 15 — IKKE fixet endnu (fase 3-arbejde)
- ✅ broen-morph 800ms auto-advance bryder tilbage — fixet via stages-model

---

## Fase 2 — Visuelle og strukturelle bugs

Mål: lektionen skal *føles pro*. Ingen koncept-redesign — kun fix af det der er åbenlyst forkert.

### Tasks

- [x] **Fjern fantom-kolonne 3-streg** — `harHundrede &&`-wrap om hundrede-ResultCell + fjern static-mode placeholder-streg helt. Tomme statiske celler er nu tomme.
- [x] **Klik-overalt-for-at-avancere** — `onClick={handleScreenClick}` på `<main>`. Klik på input/knap/link/form ignoreres for at bevare native adfærd.
- [x] **Beskeder ude af sync med scenen** — `mode="popLayout"` i stedet for `"wait"`, kortere transition (180ms), opacity-only (uden y-translate). Krydsfade i stedet for blank periode.
- [x] **Tilbage-knap i animationen** — pile-knap i header (← ArrowLeft i højre side, ved siden af "Afslut lektion"). Tastatur-shortcut `←`. Bevarer state ved bagud.
- [x] **Lille streg under 67+78 i første sekund** — fixet som bivirkning af fjernet placeholder-streg. Tomme celler under morph er nu rent tomme.
- [x] **Tekst-størrelse på "Her er et plusstykke" på mobil** — clamp ændret fra `clamp(28px, 8vw, 48px)` til `clamp(26px, 7vw, 40px)`.
- [ ] **"14" må ikke crammes på 1 plads** (din desktop-10). PARKERET — input-feltet har pt. `w-[60px] sm:w-[80px]` og `maxLength=2`, så 2 cifre fitter, men kan stadig se crammed ud. Konceptuelt fix er fase 3 (split 14 → 1 hundrede + 4 tier mens eleven taster), så vi venter.
- [ ] **"Tryk her" hint forsvinder efter brug** (din mobil-2). PARKERET — hint forsvinder allerede når fase ændres, men kan polishes (animér ud, flyt højere op på mobil). Tager det med i fase 3.
- [ ] **Beskeder for lyse / faded** (mit fund 5). PARKERET — efter sync-fix er det måske ikke længere et problem. Verificér i live-test først.

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
