# Audit — aktive findings

> Levende dokument. Hver gang en agent (visual / forklaringer / træningsmodul / ux)
> finder noget der skal fixes, noteres det her med prioritet.
>
> Den arkiverede pre-pivot-audit (på den gamle quiz-model) ligger i
> [archive/AUDIT-quiz-pivot.md](archive/AUDIT-quiz-pivot.md). De findings er
> ikke automatisk relevante — de gælder en model vi forlader.

---

## Status

**Ingen aktive findings.** Første audit på 3-lag-modellen kører når lag 1 for
første disciplin er bygget. Udfør i denne rækkefølge:

1. `traeningsmodul-reviewer` — er modulet i tråd med rubrikken?
2. `forklaringer-reviewer` — er hint-tekster lag-passende?
3. `visual-reviewer` — visuel polish + designsmag
4. `ux-reviewer` — flow virker for elev

---

## Carryover fra pre-pivot-auditen *(stadig relevante)*

Disse findings vedrørte den gamle quiz-model, men nogle gælder UI/UX-niveau
og overlever pivoten. Tag stilling pr. punkt når relevant kode røres.

### Visuel polish (gælder uanset model)
- **Layout-shift på Quiz-knap** — "Svar"-knappen bevæger sig ~36-41px ved tast/Enter.
  *Hvis vi genbruger `quiz.tsx` til lag 2: fix ved samme lejlighed.*
- **Stagger-animation langsom på dashboard** — 11 kort × 0.03s = 330ms total, opleves som flimren ved re-visit.
  *Reducér til 0.02s eller skip stagger på re-visits.*
- **NameInput er for subtil** — `text-slate-300` placeholder kan let overses.
  *Tilføj subtil baseline (`border-b border-slate-200`) i ikke-focus.*

### SMAG-overtrædelser i hint-tekster
*Gælder de gamle `lib/opgaver/*.ts`-filer. Hvis vi bevarer noget af dem som lag 2:*
- `subtraktion.ts` sub-03 og sub-05 bruger forbudt jargon (`tier-søjle`, `hundrede-søjle`)
- `multiplikation.ts` mul-05 har faktuelt forkert tip ("ganger med 10" i opgave om × 100)
- `sandsynlighed.ts` — 7 ud af 10 forklaringer afslører svaret
- 8 enkeltstående afslørende forklaringer i division, procent, hverdagsregning, diagrammer, subtraktion (se arkiveret AUDIT for detaljer)

### Manglende dækning af kendte Ismail-svagheder
- `ligninger.ts` — mangler "x på begge sider" (Ismail fejlede 8.2/8.3)
- `koordinatsystem.ts` — mangler punkt med negativ koordinat (Ismail læste forkert)

---

## Hvordan dette dokument vokser

Når en agent rapporterer ✅/⚠️/❌:
- ✅ → ingenting noteres
- ⚠️ → tilføj under "Aktive findings · ⚠️"
- ❌ → tilføj under "Aktive findings · 🔥"
- Når fixet → flyt til "Løste findings · [dato]" eller slet helt
