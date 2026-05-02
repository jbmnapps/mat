# Designsprog — FP9 Øvelsesark

Dette dokument samler det visuelle sprog for arkene. Det opdateres hver gang vi tager en ny beslutning, så alle ark forbliver konsistente.

## Mål
- **Indbydende, ikke "tørt"** — premium og moderne udtryk så eleverne har lyst til at gå i gang
- **Roligt og overskueligt** — ingen visuel støj, masser af luft mellem sektioner
- **God densitet** — luft ja, men ikke så meget at der er for få opgaver pr. side
- **Forståelsesfremmende** — visualiseringer skal forklare, ikke pynte
- **Plads til at skrive** — generøse udregningsfelter
- **Et ark = ét fokus** — ikke fire metoder på samme side, ikke seks slags opgaver. Én ting, godt løst.

## Ark-kategorier
Der findes 3 kategorier af ark. Underformer defineres ikke på forhånd — vi tilpasser indholdet pr. forespørgsel.

| Kategori | Indhold | Facit | Bruges når |
|---|---|---|---|
| **Tutorial** | Kun metode/how-to. Flere worked examples. | Nej | Eleven har misforstået metoden og skal have ren forklaring |
| **Arbejdsark** | Default. Metode + opgaver + facit. **Ark 01 (`ark/addition/arbejdsark-01.html`) er kanonisk eksempel.** Kan også laves som variant der fokuserer på fx kun prøveklar-opgaver. | Ja | Standard til daglig træning |
| **Cheatsheet** | Tabeller, konverteringsskemaer, formler — til at ligge ved siden af eleven. Én side. | Nej | Reference under løsning af opgaver |

Det kanoniske arbejdsark har 5 sektioner: **METODE → VARM OP → PÅ PAPIR → PRØVEKLAR → FACIT**.

## Tech-stack
- **Tailwind CSS via CDN** — `<script src="https://cdn.tailwindcss.com"></script>` i hvert ark
- **Custom CSS:** kun [`shared/ark.css`](shared/ark.css) — print-regler, A4-side, papirregning, FP9-svarboks. Resten klares af Tailwind-utilities.
- **Fonts:** Google Fonts — `Quicksand` (overskrifter) + `Inter` (brødtekst)

## Layout
- **Format:** A4 stående
- **Container:** `max-w-4xl mx-auto p-12` (Tailwind) — passer til A4
- **Header (kun side 1):** Stor titel, italic undertitel, navn+dato højre, **3px sort border-bunden**
- **Sidefod:** Lille grå tekst med arkets navn + sidetal
- **Sideskift:** Hver sektion eller logisk blok skiftes når den er færdig — vi balancerer så hver side er pænt fyldt uden at presse

## Typografi
- **H1 (titel):** Quicksand, 800, ~36pt — "FP9 Matematik" (eller emnespecifikt)
- **Undertitel under H1:** Italic serif, 18pt, grå — fx "Ark 01 · Addition"
- **H2 (sektionsoverskrift):** Quicksand, 800, 22pt, **UPPERCASE** med tracking-wider, sort
  - Format: `1. METODE`, `2. VARM OP`, `3. PÅ PAPIR`, `4. PRØVEKLAR`, `5. FACIT`
- **Sektions-undertekst:** Italic, 13pt, grå — én sætning, højre-justeret eller direkte under titlen
- **Brødtekst:** Inter, 400, 11pt
- **Småtekst:** Inter, 500, 9pt, uppercase, tracking-widest, grå

## Farver
**Helt minimalt — fundamentalt sort/hvid/grå med sparsom accent:**
- Tekst primær: `text-black` / `#000`
- Tekst sekundær: `text-gray-600` / `text-gray-500`
- Linjer: `border-gray-300`
- Baggrund: hvid
- **Accent:** Bruges sparsomt — fx gul highlight på prøveklar-instruktion, eller en farvet operator i metode-eksempel
  - Operator i metoden: addition grøn `text-emerald-600`, subtraktion rød `text-rose-600`, multiplikation violet `text-violet-600`, division amber `text-amber-600`
  - **Men ikke** farvede bokse rundt om alt — kun selve operatoren / mente-cifret kan være farvet

## Sektionsstruktur (gentagen i alle ark)

Hvert ark har **5 sektioner** i denne rækkefølge:

| # | Navn | Formål | Indhold |
|---|---|---|---|
| 1 | METODE | Vis hvordan du gør | ÉN clean udregning + 1-2 sætninger |
| 2 | VARM OP | Direkte anvendelse | 6-8 simple opgaver i grid |
| 3 | PÅ PAPIR | Standard | 4-6 opgaver med udregningsfelt |
| 4 | PRØVEKLAR | FP9-replikering | 2-3 realistiske FP9-opgaver |
| 5 | FACIT | (separat side) | Svar + lille noter til samtalen efter |

**Sektions-anatomi:**
```
1. METODE                                    [italic instruction here]
─────────────────────────────────────────────────────────────────────

[ content ]
```
- Numerisk præfix
- Stor uppercase titel
- Italic instruktion til højre eller under
- Tynd grå linje under
- Indhold med god luft

## Metode-sektion — princip
**Eleverne springer tekstbunker over.** Reglen er minimal, det visuelle bærer.

Indeholder:
1. **Én sætning** der forklarer princippet (max ~12 ord)
2. **Én worked example** — ren udregning, vist som man ville skrive den på papir
3. *(valgfrit)* **Én "Husk:"-linje** hvis der er en typisk faldgrube

**Vi undgår:** flere methoder på samme side, lange forklaringer, nummererede trin-paragraffer, fire-kolonners decimal-grids.

## Worked example — papirregning
Tabulære tal, højre-justeret. Mente vist som lille superscript i operatorens farve. Streg over resultatet.

Eksemplet matcher det kanoniske arbejdsark (`ark/addition/arbejdsark-01.html`), så tutorial og arbejdsark deler det samme metode-eksempel:

```
   ¹               ← mente i grøn
  2 4 7
+ 1 3 9
─────────
  3 8 6            ← resultat
```

## FP9-replikering — princip
De sidste 2-3 opgaver i hvert ark skal **ligne rigtige FP9-opgaver**:
- Realistisk indpakning ("Tobias køber...", "Skitsen viser...")
- FP9-imperativ ordlyd ("Hvor meget...", "Hvor stor en procentdel...")
- **FP9-svarboks**: lille rektangulær boks med stiplet kant + enhed bag (`kr.`, `%`, `cm` osv.)
- Eleverne skal genkende formatet på prøvedagen

## Print
- A4 stående
- `@media print` skjuler skærm-only elementer (print-tip)
- `print-color-adjust: exact` så accent-farver bevares
- Page-breaks via `break-after: page` mellem sektionsgrupper
- **Sidste side = facit** — så læreren kan vælge at printe alt og rive facit af

## Genbrugelige SVG-mønstre

Disse komponenter er bygget i `ark/addition/arbejdsark-01.html` og kan kopieres når næste ark har brug for dem. Tilføj nye mønstre her efterhånden.

### Papirregning med pil (metode-eksempel)
*Bruges i: addition/arbejdsark-01.html (sektion METODE)*

Inline SVG der viser en kolonneopstilling (3 cifre + 3 cifre = 3 cifre) med en blød grøn buet pil der viser mente-cifret rejse fra én søjle til den næste. Værdier (numre, mente-tal) er parametre. Genbrugelig til subtraktion (rød pil for lån), multiplikation (violet) og division (amber).

### Prisskilte (FP9-replikering, implicit opgave)
*Bruges i: addition/arbejdsark-01.html (Opgave 4.3)*

Pentagonisk prisskilt-form (med "string-hul") fyldt med soft-pastel-farve, varenavn øverst, pris nederst i fed Quicksand. Lægges på række (3-4 stk.) hvoraf én typisk er **distraktor** (uden for spørgsmålet). Træner læseforståelse + addition.

### Mobilbank-mockup (FP9-replikering, transaktioner)
*Bruges i: addition/arbejdsark-01.html (Opgave 4.4)*

Telefon-skærm-lignende kort med top-bar ("MOBILBANK" + tid) + transaktionsliste. Hver transaktion: rund avatar med initial + navn + lille beskrivelse + grøn beløb til højre. Bruges til opgaver hvor eleven skal aflæse beløb fra "skærmen" og lægge sammen.

### Andre mønstre der mangler at blive bygget
- Kassebon (lang stribe med varer + priser + total — godt til addition og procent)
- Søjlediagram (statistik)
- Linjediagram (statistik)
- Geometrisk skitse med vinkler (vinkler-arket)
- Koordinatsystem med punkter (koordinatsystem-arket)
- Isometrisk kasse med G og h (rumfang-arket)

## Beslutningslog
- *2026-04-29 v1:* Initial — Deep blue + Georgia. Forkastet (for tørt).
- *2026-04-29 v2:* Inter + 4 farveidentitet pr. regneart + operator-badges. Forkastet (for cluttered, for meget tekst, og for stor en metode-side med 4 ting på én gang).
- *2026-04-29 v3:* **Adopteret stilen fra ANTIGRAV1** — Tailwind via CDN, Quicksand+Inter, ren sort/hvid/grå med sparsom accent. Ét ark = ét regneart. Sektioner: METODE → VARM OP → PÅ PAPIR → PRØVEKLAR → FACIT. Numererede uppercase-overskrifter med italic instruktion. Ingen farvede bokse rundt om alt.
- *2026-04-29 v4:* **Mappe-struktur og 3 kategorier.** Ark organiseres pr. emne i undermapper (`ark/addition/`, `ark/subtraktion/` osv.). Inden for hver mappe findes 3 ark-typer: tutorial, arbejdsark, cheatsheet. Det kanoniske arbejdsark er `ark/addition/arbejdsark-01.html`.
