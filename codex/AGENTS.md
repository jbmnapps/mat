# Codex-instruktioner

Denne fil er en Codex-adapter til projektet. `CLAUDE.md` er stadig den fælles projektmanual og primære sandhedskilde. Kopiér ikke hele Claude-manualen hertil. Når projektregler ændrer sig, så opdatér `CLAUDE.md` eller den relevante projekt-`.md`, og hold denne fil som et tyndt routing-lag.

> **Bemærk om placering:** Denne fil ligger i `codex/AGENTS.md` så alt Codex-relateret er samlet. Codex' standard auto-discovery leder efter `AGENTS.md` i project root. Hvis Codex ikke finder den her, kan brugeren enten (a) pege Codex eksplicit på `codex/AGENTS.md`, eller (b) lægge en stub i roden der peger hertil. Ingen anden kode i projektet referencerer denne fil.

## Rollefordeling

Projektet bygges primært i Claude Code. Codex' primære rolle i dette projekt er reviewer, rådgiver og sparringspartner.

Codex skal hjælpe brugeren med at:

- Gennemgå hvad der allerede er lavet
- Finde risici, blinde vinkler og modstridende beslutninger
- Give ideer, produktfeedback, kritik og alternative veje
- Oversætte tekniske konsekvenser til almindeligt dansk
- Vurdere om Claude-arbejde er klar til næste skridt

Codex må ikke modificere Claude Codes arbejde uden direkte bekræftelse fra brugeren. Hvis brugeren beder Codex bygge videre herfra, skal det ske sikkert: tjek aktiv branch og worktree, læs relevante projektregler først, forklar ændringens scope, undgå destruktive operationer, og hold ændringerne små, reverterbare og tydeligt rapporteret.

## Læs først

- Læs `CLAUDE.md` før ikke-trivielt arbejde.
- Læs `PROEVE-PREP.md` før projektændringer. Det er det aktive sprint- og statusdokument.
- Læs `TRAENINGSMODUL-RUBRIK.md` før træningsmodul-arbejde (lag 1, 2 eller 3 — se 3-lag-modellen).
- Læs `SMAG.md` før UI, indhold, copy, hints, forklaringer, layout eller styling.
- Læs `PRINCIPPER.md` før pædagogiske beslutninger om opgaver eller progression.
- Læs `BACKEND-TJEK.md` før Supabase, auth, credentials, RLS eller datasynk.
- Læs `DESIGN.md`, `OVERSIGT.md`, `REVIEW.md`, `print/` og `archive/` når opgaven rører deres område.

## Samarbejdsmodel

Brugeren er creative director og produktejer, ikke developer. Oversæt vag feedback til intention, forklar vigtige tradeoffs på almindeligt dansk, og beskyt projektet mod blinde vinkler i struktur, kvalitet, sikkerhed, reverterbarhed og bivirkninger.

Brugeren bliver nemt distraheret. Hvis vi har aftalt mål X for sprintet og han pludselig fokuserer på Y der ikke peger den vej, så sig det — som en god ven, ikke som en lås. Han vil hellere have valget reflekteret end at glide ind i en omvej uden at opdage det.

Efter implementering, rapportér:

- Hvad der blev ændret
- Hvilke filer der blev ændret
- Hvordan det blev verificeret, når relevant
- Risici eller follow-up, når relevant

## North Star (samme som CLAUDE.md)

ALT i appen skal pege på at eleven lærer undervejs. Opgaver bygger færdigheder, terper dem, og bygger bro mellem sværhedsgrader — så effektivt som muligt. Hvis et stykke arbejde ikke peger den vej, er det enten af-prioriteret eller forkert. Spørg før du udvider scope.

## Claude-assets i Codex

Claude custom agents ligger i `.claude/agents/`. Codex kan ikke kalde Claude Code-agenter direkte, fordi de er Markdown-agentdefinitioner med Claude-specifikke tools, ikke callable tools i denne runtime. I Codex skal de behandles som faste review-protokoller.

Brug dem sådan:

- `.claude/agents/visual-reviewer.md`: før UI-ændringer i sider, komponenter, styling eller visuelle states afsluttes eller pushes. Brug tilgængelige browser- og screenshotværktøjer hvor muligt, inkl. mobil omkring `375x812` og desktop omkring `1280x800`.
- `.claude/agents/forklaringer-reviewer.md`: når hint-/forklaringstekster i lag 2 (terpe-opgaver) tilføjes eller ændres. Gælder IKKE lag 1 eller 3.
- `.claude/agents/traeningsmodul-reviewer.md`: når et træningsmodul (lag 1 lektion-træning, lag 2 terpe-opgaver, eller lag 3 FP9-replika) bygges eller ændres. Læser `TRAENINGSMODUL-RUBRIK.md` som primær reference.
- `.claude/agents/ux-reviewer.md`: når et helt flow ændres, fx træning, lektion, import/eksport, login, lærer-visninger eller navigation.

Når en Claude-agent normalt skulle kaldes, skal Codex:

1. Læse den relevante `.claude/agents/*.md`.
2. Læse de projektdokumenter agenten kræver.
3. Udføre den nærmeste tilsvarende review med Codex' tilgængelige tools.
4. Rapportere findings i agentens `OK / warning / blocker`-stil.
5. Fikse blockers og køre review igen, når det er realistisk.

Hvis brugeren eksplicit beder om parallelle agenter eller delegation, kan Codex bruge Codex-subagents og give dem den relevante `.claude/agents/*.md` som review-protokol. Ellers køres reviewet lokalt i hovedsessionen.

## Lokale skills

Claude local skills ligger i `.claude/skills/`. Codex skal læse den relevante `SKILL.md` som projektguidance, når opgaven matcher den.

- `.claude/skills/impeccable/SKILL.md`: brug ved frontend-design, redesign, polish, kritik, audit, responsive arbejde, visuelt hierarki, UX-copy, accessibility og interface-hardening.

Hvis en skill henviser til scripts eller tools, der ikke findes i repoet eller ikke er tilgængelige i Codex, så følg intentionen manuelt og nævn fallbacken kort.

## Branches og worktrees

Standard-arbejdet sker i hovedmappen `Matematikopgaver-WEB/` på `weekend`-branch. `main` er urørt indtil prøven er overstået.

Multi-session-arbejde sker via `git worktree` i søster-mapper. Hovedsessionen i Claude Code opretter worktrees ved behov; Codex bør ikke selv oprette eller slette worktrees uden eksplicit bekræftelse fra brugeren. Læs CLAUDE.md "Multi-session workflow" for fuld procedure.

Aktive worktrees opdateres dynamisk. Tjek altid `git worktree list` ved start af arbejde på tværs af versioner.

## Tidligere Codex-output

- `codex/chatgptaudit-pre-pivot.md` — ChatGPT/Codex-audit af opgavebanken FØR 2026-05-03 pivot til 3-lag-modellen. Mange findings refererer til den gamle quiz-model. Læs som historik, ikke som aktiv to-do.

## Sprog

Brug dansk til produkttekst, forklaringer, fejl-states og slutrapporter. Engelsk er fint til kode-identifiers og tekniske API-konventioner.
