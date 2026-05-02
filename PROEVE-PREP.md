# Prøve-prep weekend (FP9 mandag 4. maj 2026)

> **For nye Claude-sessions:** start her. Læs hele dokumentet. Du arbejder i en kort, presset sprint, ikke et langsigtet projekt. Kvalitet > omfang. Spørg før du udvider scope. Pluk-op-fra-status-sektionen herunder for at vide hvor vi er.

Akut arbejdsdokument. Eleverne har FP9 Matematik på mandag. Vi bygger træningsapp i weekenden så de kan øve på telefon. Live på `https://jbmnapps.github.io/mat/`.

Branch: `weekend`. `main` står urørt.

---

## Status nu (opdateres efter hver session)

**Sidst opdateret:** 2026-05-02, lørdag eftermiddag

**Live deployet:** https://jbmnapps.github.io/mat/

**Færdige bølger:** 1, 2, 3, 4, 5 (indhold + design + deploy + cache-fix)

**13 discipliner med træning** (12 opgaver hver = 156 opgaver):
- Tal & algebra: addition, subtraktion, multiplikation, division, procent, ligninger, hverdagsregning
- Geometri: enhedsomregning, rumfang, koordinatsystem
- Statistik: tabeller, diagrammer, sandsynlighed

**Mangler:** vinkler, ligedannethed, overslagsregning, regneudtryk (mindre kritiske).

**Næste op:**
- Bølge 6: Backend (Supabase) — kræver brugerens input til projekt-setup
- Brugerens browser-test og feedback på det deployede

**Kendte begrænsninger:**
- Kun lektion bygget for addition (premium-stil). Andre discipliner viser "Lektion kommer snart".
- Prøveklar-mode endnu ikke bygget (træning bruger samme metode `registrérPrøveklarForsoeg` for at status vises på dashboard — splittes når prøveklar kommer).
- Koordinatsystem-opgaver er rent tekstuelle. Visualiseringer kræver eget format.
- Login og remote control virker ikke i den nuværende Claude-session (auth-restriktion).

**Vigtigste arbejds-løkke:**
1. Lav ændring → push til `weekend` → GitHub Actions bygger og deployer → ~2 min så live
2. Brug Claude in Chrome til visuelt selvstjek FØR push på UI-ændringer
3. Brug review-agent (general-purpose) til opgave-QC efter en bølge

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
