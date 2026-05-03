# Audit — aktive findings

> Levende dokument. Hver gang en agent (visual / forklaringer / træningsmodul / ux)
> finder noget der skal fixes, noteres det her med prioritet.
>
> Den arkiverede pre-pivot-audit (på den gamle quiz-model) ligger i
> [archive/AUDIT-quiz-pivot.md](archive/AUDIT-quiz-pivot.md). De findings er
> ikke automatisk relevante — de gælder en model vi forlader.

---

## Aktive findings — addition-lektion (2026-05-03 søndag aften)

UX-review fandt 4 kritiske issues + flere mindre. Visual-reviewer: ingen
blockers. Træningsmodul-reviewer kunne ikke køre (agent-registret var stale
ved session-start; kræver Claude Code-restart for at se den nye agent-fil).

### 🔥 Kritisk — bryder regler

- **Tilbage-knap mental model.** Header har "Afslut lektion" (link) + rund
  pile-knap der gør forskellige ting. Eleven kan tro pilen tager dem helt
  ud. *Forslag:* skjul pilen helt på første fase i stedet for at disable.

- **Tilbage efter godkendt svar = sidder fast.** Hvis eleven trykker tilbage
  efter at have svaret rigtigt på fx 4+4, kommer hun til input-fasen igen,
  men `enereGodkendt`-flag er stadig sat → input er ikke aktivt. Hun kan se
  sit godkendte svar, men ikke svare igen. Bryder
  TRAENINGSMODUL-RUBRIK.md-reglen om frem/tilbage-navigation.
  *Forslag:* `forrigeFase` skal nulstille korrekt-flag og input-værdi når
  ny fase er en input-fase.

- **Forkert svar = bare shake + tomt felt. Ingen besked.** Eleven ved ikke
  om det var forkert eller om noget bare gik galt med hendes input. Bryder
  rubrik-reglen "forkert svar = prøv igen + bedre forklaring".
  *Forslag:* vis kort hint-besked under input ("Prøv igen") eller skift
  overskriften kortvarigt — pædagogisk tone, ikke "FEJL".

- **På 67+78 enere accepteres BÅDE 5 og 15** uden at eleven informeres om
  at begge er gyldige. Kan forvirre — hun kan tro hun trykkede tasten
  forkert. *Forslag:* eksplicit besked når 5 accepteres
  ("Du gav enere-cifret 5 — det er rigtigt. Vi rykker 1 op.")

### ⚠️ Bør fixes

- **`broen-morph` 800ms auto-advance bryder tilbage-navigation.** Hvis
  eleven trykker tilbage fra `spørg-enere-2`, lander hun i `broen-morph`,
  og 800ms senere kastes hun frem igen. Tilbage virker ikke i praksis fra
  den fase. *Forslag:* skip `broen-morph` i `forrigeFase` eller annullér
  timeout ved fase-skift.

- **"1 skal rykkes"-tekst kan være jargon-grænseland.** SMAG.md siger
  "mente" er ikke OK — "rykkes" er tæt på samme. *Forslag:* alternativt
  fraseret som *"15 er for stort til én plads. Vi flytter 1 op."*

- **Fejringer ("Flot. Det giver 78.") mangler visualisering** af hvor
  resultatet kommer fra. For svag elev kan det være uklart hvorfor "78"
  pludselig nævnes. *Forslag:* highlight resultat-rækken eller animér
  cifrene som læses sammen.

### 💡 Idéer til fremtid

- "Spring til træning"-genvej for stærkere elever
- Progress-indikator i header (fx "Trin 3 af 14")
- Re-spil mente-animation (tap på mente '1' for at se den igen)
- Lyd-feedback (ding/buzz) som option

---

## Carryover fra pre-pivot-auditen *(stadig relevante)*

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
