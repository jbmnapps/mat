# ChatGPT Audit — opgavebank mod FP9-mål og prøvebank

> Rapport-only. Denne audit er skrevet som reviewer/rådgiver-input til Claude Code og brugeren. Ingen opgavekode er ændret.

## Grundlag

- Projektets statede mål: hurtig FP9-træningsapp til 9. klasse uden hjælpemidler.
- Primære kvalitetskriterier: overskueligt for svag elev, FP9-knaphed, korrekthed, progression, prøvebank-match og distraktorer.
- Læste projektdokumenter: `CLAUDE.md`, `PROEVE-PREP.md`, `PRODUCT.md`, `PRINCIPPER.md`, `SMAG.md`, `REVIEW.md`, `OVERSIGT.md`, `.claude/agents/opgaver-reviewer.md`, `.claude/agents/forklaringer-reviewer.md`.
- Sammenlignet med prøvebankens FP9 uden hjælpemidler:
  - `prøvebanken/FP9 Matematik uden hjælpemidler maj 2024.pdf`
  - `prøvebanken/FP9 Matematik uden hjælpemidler maj 2025.pdf`
  - `prøvebanken/FP9 Matematik uden hjælpemidler december 2025.pdf`
  - tilhørende facitlister.
- Appens aktive opgavebanker: 13 discipliner x 12 opgaver = 156 opgaver.

## Overordnet vurdering

- Opgavebanken er brugbar som hurtig træning.
- Den dækker mange rigtige FP9-emner.
- Den er endnu ikke stærk som FP9-replikering.
- For mange opgaver er tekstversioner af noget, der i prøvebanken er visuelt, aflæsningsbaseret eller pakket ind i figurer, tabeller og distraktorer.
- Der blev ikke fundet åbenlyst forkerte facit i de læste opgavebanker.

## Findings

### F1 — Fem centrale FP9-områder mangler træningsindhold

- Status: blocker for fuld FP9-dækning.
- Filer: `lib/content-registry.ts`, `lib/opgaver/index.ts`, `lib/disciplines.ts`.
- Mangler:
  - `decimaltal`
  - `regneudtryk`
  - `overslagsregning`
  - `vinkler`
  - `ligedannethed`
- Hvorfor det betyder noget:
  - Alle fem områder findes som discipliner i produktet.
  - Flere er nævnt som kendte svagheder i `PRINCIPPER.md`.
  - Prøvebanken tester dem tydeligt i flere sæt.
- Anbefaling:
  - Byg disse fem som første indholdsbølge før yderligere polish.

### F2 — Visuelle FP9-opgavetyper er reduceret til tekst

- Status: stor mismatch mod prøvebanken.
- Filer:
  - `lib/opgaver/koordinatsystem.ts`
  - `lib/opgaver/diagrammer.ts`
  - kommende `vinkler` og `ligedannethed`.
- Observation:
  - `koordinatsystem.ts` siger selv “ingen grafik”.
  - `diagrammer.ts` beskriver diagrammer i tekst.
- Prøvebank-match:
  - FP9 bruger rigtige koordinatsystemer, søjlediagrammer, linjediagrammer, boksplot, skitser, tabeller og geometriske figurer.
- Konsekvens:
  - Eleverne træner beregning, men ikke selve aflæsningen.
  - Det gør appen mindre prøvenær.
- Anbefaling:
  - Lav visuelle opgaver til mindst koordinatsystem, diagrammer, vinkler og ligedannethed.
  - Hver visuel opgave bør have mindst én distraktorværdi.

### F3 — Hints bryder egne sprogressler

- Status: bør fixes bredt.
- Eksempler:
  - `lib/opgaver/addition.ts`: “enerne”, “mente”, “tier-søjlen”.
  - `lib/opgaver/subtraktion.ts`: “tier-søjlen”, “hundrede-søjlen”.
  - `lib/opgaver/tabeller.ts`: “sum”.
  - `lib/opgaver/rumfang.ts`: “side³”.
  - `lib/opgaver/procent.ts`: “nævneren”.
- Hvorfor det betyder noget:
  - `SMAG.md` siger eksplicit, at forklaringer skal være korte, handlingsorienterede og uden jargon.
  - Svage elever springer let fagord over.
- Anbefaling:
  - Kør en samlet hint-revision på alle `forklaring`-felter.
  - Brug formatet: “Tip: først X. Så Y.”
  - Undgå fagord, medmindre de forklares i samme sætning.

### F4 — Flere hints afslører for meget

- Status: bør fixes.
- Eksempler:
  - `lib/opgaver/multiplikation.ts`: `25 · 4` forklares som “det samme som en 100-kroneseddel”.
  - `lib/opgaver/sandsynlighed.ts`: flere hints giver direkte brøk/procent eller alle udfald.
  - `lib/opgaver/diagrammer.ts`: nogle procent-hints giver mellemregningen meget direkte.
- Hvorfor det betyder noget:
  - Projektets regel er, at hints må give metode, ikke svaret.
  - Ellers bliver feedbacken til facit-afsløring frem for læring.
- Anbefaling:
  - Omskriv afslørende hints til spørgsmål eller metode.
  - Eksempelprincip: “Hvilket gangestykke passer?” frem for “X ud af Y = Z%”.

### F5 — Ligninger er for smalle ift. projektets egne mål

- Status: fagligt hul.
- Fil: `lib/opgaver/ligninger.ts`.
- Observation:
  - Opgaverne træner primært enkle ligninger og få totrinsligninger.
  - Projektets principper nævner specifikt svaghed i ligninger med x på begge sider.
- Prøvebank-match:
  - FP9 tester ligninger, regneudtryk og algebraisk struktur mere bredt end den nuværende bank.
- Anbefaling:
  - Tilføj opgaver med x på begge sider.
  - Tilføj opgaver hvor eleven skal vurdere, hvilket udtryk/ligning der matcher en situation.
  - Overvej at flytte noget af dette til den manglende `regneudtryk`-disciplin.

### F5a — Opgaverne er ofte forkert stilladseret for elever, der ikke kan disciplinen endnu

- Status: grundlæggende læringsproblem.
- Gælder især:
  - `lib/opgaver/procent.ts`
  - `lib/opgaver/multiplikation.ts`
  - `lib/opgaver/division.ts`
  - `lib/opgaver/ligninger.ts`
  - `lib/opgaver/enhedsomregning.ts`
- Observation:
  - Opgavebankerne har ofte emne-progression, men ikke lærings-stillads.
  - De starter nogle steder for hurtigt med opgaver, der forudsætter at eleven allerede kan metoden.
  - Hints kommer først efter svar og er ofte for korte til at lære en ukendt metode.
- Eksempel:
  - I procent går rækken hurtigt fra 10%, 25% og 50% til rabat, stigning, brøk/procent/decimal og baglæns moms.
  - For en elev der ikke kan procent, mangler der bro-opgaver mellem “procent betyder del af 100” og “stigning ÷ startværdi · 100”.
- Hvorfor det betyder noget:
  - Træning må ikke bare sortere elever efter hvem der allerede kan stoffet.
  - Den skal hjælpe en svag elev op ad trappen.
- Anbefaling:
  - Hver opgavebank skal bygges som læringsstige: metode → guidet warm-up → næsten samme opgave → selvstændig standard → variation → FP9-replikering.
  - Der må ikke introduceres en ny matematisk idé uden en bro-opgave først.
  - Brug mini-illustrationer, animationer, trinvis feedback og interaktive modeller direkte i opgaveflowet.
  - Læringsopgaver bør kunne give eleven et nyt forsøg, før de går videre til næste opgave.

### F6 — Regneudtryk og indsæt-tal er helt centrale, men mangler

- Status: blocker for FP9-match.
- Manglende disciplin: `regneudtryk`.
- Prøvebank-match:
  - FP9 har gentagne opgaver af typen “Indsæt tal, så udtrykkene bliver sande” og “Hvilket udtryk har samme værdi som...”.
- Anbefaling:
  - Byg `regneudtryk` med 12 opgaver:
    - varm-op med indsæt-tal
    - parenteser
    - negative tal
    - samme værdi som et andet udtryk
    - multiple choice med plausible distraktorer.

### F7 — Overslagsregning mangler som selvstændig træning

- Status: blocker for FP9-match.
- Manglende disciplin: `overslagsregning`.
- Prøvebank-match:
  - FP9 har faste “Brug overslagsregning” multiple choice-opgaver.
  - De tester størrelsesorden, ikke præcis beregning.
- Anbefaling:
  - Byg `overslagsregning` som primært multiple choice.
  - Brug svarmuligheder der ligger i hver sin størrelsesorden.
  - Dæk procent, division, multiplikation og decimaltal.

### F8 — Vinkler og ligedannethed mangler, selv om de fylder tydeligt i prøvebanken

- Status: blocker for geometri-dækning.
- Manglende discipliner:
  - `vinkler`
  - `ligedannethed`
- Prøvebank-match:
  - Vinkler testes med skitser, forlængede sider, parallelle linjer og ukendte vinkler.
  - Ligedannethed testes med længdeforhold og arealfaktor.
- Anbefaling:
  - Byg dem visuelt fra starten.
  - Undgå rene tekstspørgsmål som “en trekant har...”.
  - Brug skitser med mål og distraktorer.

### F9 — Decimaltal mangler som selvstændig disciplin

- Status: fagligt hul.
- Manglende disciplin: `decimaltal`.
- Prøvebank-match:
  - FP9 bruger decimaltal i regnearter, brøker, enhedsomregning, procent og hverdagskontekster.
- Projektmatch:
  - `PROEVE-PREP.md` siger, at decimaltal ikke skal blandes ind i addition, men være separat.
- Anbefaling:
  - Byg `decimaltal` med komma/punktum-input, afrunding, brøk-decimal-procent og enheder.

### F10 — Hverdagsregning har god bredde, men ordlyden er nogle steder for talesproglig

- Status: polish/faglig stil.
- Fil: `lib/opgaver/hverdagsregning.ts`.
- Observation:
  - Flere opgaver bruger “du”-formuleringer.
  - FP9-formen er typisk mere knap og neutral: “Hvor meget...”, “Hvor mange...”.
- Eksempler:
  - “Du betaler...”
  - “Du går...”
  - “Hvor meget skal du bruge...”
- Anbefaling:
  - Omskriv mod FP9-knaphed.
  - Brug navne eller neutral formulering, ikke samtaleform.

### F11 — Statistik og diagrammer mangler ægte dataaflæsning

- Status: stor mismatch mod prøvebanken.
- Filer:
  - `lib/opgaver/diagrammer.ts`
  - `lib/opgaver/tabeller.ts`
- Observation:
  - Der er mange tekstbeskrevne diagrammer og tabeller.
  - Prøvebanken tester aflæsning af faktiske visuelle data, procentpoint, procentændring, gennemsnit og boksplot.
- Anbefaling:
  - Tilføj rigtige små diagram-komponenter eller SVG-opgaver.
  - Tilføj boksplot eller mindst kvartil-/median-aflæsning som visuel opgave.
  - Sørg for at eleven skal aflæse, ikke bare læse tal i teksten.

### F12 — Sandsynlighed er bred, men nogle opgaver passer bedre som læring end prøve-replikering

- Status: mindre fagligt mismatch.
- Fil: `lib/opgaver/sandsynlighed.ts`.
- Observation:
  - Opgaverne dækker mønt, terning, poser, kort og kombinatorik.
  - Flere hints er meget eksplicitte.
  - Prøvebanken tester ofte sandsynlighed som brøk/procent/decimal med konkrete objekter og flere kast.
- Anbefaling:
  - Behold bredden.
  - Tilføj 2-3 mere prøvebank-lignende opgaver med ukendt antal sider eller gentagne kast.
  - Gør hints mindre facit-afslørende.

## Prioriteret næste bølge

1. Byg de manglende discipliner:
   - `overslagsregning`
   - `regneudtryk`
   - `vinkler`
   - `ligedannethed`
   - `decimaltal`
2. Lav visuelle FP9-replikaer:
   - koordinatsystem
   - diagrammer
   - vinkler
   - ligedannethed
3. Re-stilladser eksisterende opgavebanker:
   - metode først
   - guidet warm-up
   - bro-opgaver før nye idéer
   - integrerede illustrationer/animationer hvor metoden er abstrakt
   - trinvis feedback og mulighed for at prøve igen i læringsopgaver
4. Revider alle hints:
   - fjern jargon
   - fjern facit-afsløring
   - brug kort metodeform
5. Tilføj 2-3 prøvebank-lignende opgaver pr. aktiv disciplin:
   - hverdagsindpakning
   - distraktorværdi
   - FP9-knaphed
   - multiple choice hvor det matcher prøven.

## Kort konklusion

Skelettet er godt, og mængden er imponerende for en weekendversion. Men hvis målet er at gøre eleven mere prøveklar til FP9 uden hjælpemidler, skal næste arbejde handle mindre om flere almindelige quizspørgsmål og mere om prøvebankens virkelige form: skitser, diagrammer, tabeller, distraktorer, overslag, regneudtryk og knap FP9-ordlyd.
