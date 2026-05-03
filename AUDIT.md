# Audit-rapport + prioriteret fix-liste

> Synteseret fra 3 parallelle agent-audits kørt 2026-05-03. Bruges som handoff
> mellem sessions. Næste session læser denne + PROEVE-PREP.md først.

**Audit-omfang:**
- forklaringer-reviewer: alle 91 `forklaring`-strenge i `lib/opgaver/*.ts`
- opgaver-reviewer: alle 156 svar manuelt verificeret + sekvens-vurdering
- visual+UX-reviewer: dashboard, disciplin-side, lektion, træning via Claude in Chrome

**Headline:** Designsproget er på "Pro"-niveau — typografi, farver, spacing, animationer er konsistente. **156 svar er matematisk korrekte.** Men der er ÉN kritisk regression-bug og en række forklaring-svagheder der skal fixes før flere elever bruger den.

---

## 🔥 Prioritet 1 — Kritisk (fix før flere elever bruger den)

### 1.1 State-bug i Quiz: forrige feedback hænger ved på næste opgave

**Sted:** [components/quiz.tsx](components/quiz.tsx) — variablen `erReview` på ~linje 78.

**Symptom:** Eleven svarer opgave 1, klikker "Næste opgave", lander på opgave 2 — men ser stadig sit forrige svar i input-feltet og "Rigtigt"/"Forkert"-feedback. Knappen siger "Næste opgave" i stedet for "Svar".

**Rod:** `erReview = aktivIndex < resultater.length`. Lige efter submit er `aktivIndex=0, resultater.length=1`, så `erReview = true`. `næsteHandler` peger derfor på `navigerFrem` (rydder ikke state) i stedet for `gåVidere` (rydder state).

**Fix:** Indfør et separat `justSubmitted`-state der sættes til `true` ved submit og `false` ved enhver navigation. Brug det som handler-discriminator.

```ts
const [justSubmitted, setJustSubmitted] = useState(false);

// I submitNumeric/submitMC: setJustSubmitted(true) efter setFeedbackVist(true)
// I gåVidere/navigerTilbage/navigerFrem: setJustSubmitted(false)

// Brug justSubmitted til handler-valg:
const næsteHandler = justSubmitted ? gåVidere : navigerFrem;

// Display kan stadig bruge erReview = aktivIndex < resultater.length
// (display fra resultater[aktivIndex] når der ER et saved resultat)
```

**Test efter fix:** svar opgave 1 → klik Næste → opgave 2 skal være BLANK + knappen "Svar".

---

### 1.2 SMAG-overtrædelser i forklaringer (forbudt jargon)

**Sted:** [lib/opgaver/subtraktion.ts](lib/opgaver/subtraktion.ts).

**Symptom:** To opgaver bruger eksplicit forbudte fagord (jf. SMAG.md "Pædagogik & sprog").

**sub-03** (73 − 28):
- Nu: *"Tip: 3 er mindre end 8 — lån 1 fra **tier-søjlen**."*
- Foreslået: *"Tip: regn 73 − 30 først. Læg 2 til svaret."*

**sub-05** (503 − 247):
- Nu: *"Tip: når der står 0 i midten, må du låne fra **hundrede-søjlen** først."*
- Foreslået: *"Tip: 503 = 500 + 3. Træk 247 fra 500 først."*

---

### 1.3 mul-05 har FAKTUELT FORKERT tip

**Sted:** [lib/opgaver/multiplikation.ts](lib/opgaver/multiplikation.ts).

**Symptom:** Opgaven er `35 · 100`, men tippet siger *"hver gang du ganger med **10**"*. Forkert pædagogisk hjælp — eleven får ikke det rigtige antal pladser.

**Fix:** Ret til *"Tip: når du ganger med 100, rykker cifrene to pladser til venstre."*

---

### 1.4 Subtitle stadig på disciplin-side

**Sted:** [app/[disciplin]/page.tsx](app/[disciplin]/page.tsx) ~linje 69.

**Symptom:** SMAG.md siger eksplicit *"Subtitle 'Læg sammen på papir' inde i kort — overflødig dekoration"*. Den blev fjernet fra dashboard-kortene, men er stadig på disciplin-headeren via `disciplin.beskrivelse`.

**Fix:** Fjern `<p>{disciplin.beskrivelse}</p>` fra disciplin-headeren. Symbolet + disciplin-navnet er nok.

---

## ⚠️ Prioritet 2 — Større scope (forklaringer der afslører svar)

16 ud af 91 forklaringer afslører svaret eller næsten-afslører det. Listet med kort-fix-forslag:

### sandsynlighed.ts — systemisk problem

7 ud af 10 forklaringer er på formen *"X ud af Y = Z%"* hvor Z = svaret. Hele filen skal omformuleres til spørgsmåls-format.

**Skabelon:**
- ❌ *"3 ud af 5 = 60%"* (afslører)
- ✅ *"3 røde ud af 5 i alt. Skriv som procent."* (handling)

**Konkrete fix:**
- san-02 (1/6 i procent): fjern *"≈ 0,167 = 16,7%"* → *"Tip: 1 ud af 6. Del 1 med 6 og gang med 100."*
- san-03 (lige tal terning): *"Tip: hvor mange af 1-6 er lige tal?"*
- san-05 (3/5 røde): *"Tip: 3 ud af 5. Skriv som procent."*
- san-06 (mønt 2 gange): *"Tip: skriv alle muligheder ned. P=plat, K=krone."*
- san-07 (2 terninger udfald): *"Tip: gang antal muligheder for hver terning sammen."*
- san-08 (ikke-rød): *"Tip: hvor mange er IKKE røde? Skriv som procent af 10."*
- san-09 (>6 på spinner): *"Tip: hvilke felter er over 6? Tæl ud af 8."*
- san-10 (hjerter af 52): *"Tip: hvor mange hjerter er der? Skriv som brøk af 52."*

### division.ts — dekomposition afslører svar

- div-03 (64 : 4 = 16): nu *"60 : 4 = 15, og 4 : 4 = 1. Læg sammen"* (15+1=16=svar). Foreslå *"Tip: del 64 op i 60 + 4. Del hver del med 4."*
- div-05 (156 : 12 = 13): nu giver *"12 · 10 = 120, og der mangler 36 = 12 · 3"* (10+3=13=svar). Foreslå *"Tip: hvor mange gange går 12 op i 156? Start med 12 · 10."*
- div-12 (480 : 8 = 60): nu giver *"8 · 6 = 48, så 8 · 60 = 480"* (60=svar). Foreslå *"Tip: 8 · noget = 48. Hvad så når det er 480?"*

### Andre afslørende forklaringer

- **pct-07** (3/4 som procent): *"1/4 = 25%, så 3/4 = 3 · 25%"* (75=svar). Foreslå *"Tip: hvor mange procent er 1/4?"*
- **hvd-07** (24 km, 1/3 kørt → 16 km tilbage): *"1/3 = 8 km. Træk fra de 24"* (24-8=16=svar). Foreslå *"Tip: del 24 i 3 lige store dele. Hvor mange er der tilbage?"*
- **dia-07** (24/70 ≈ 34%): *"24/70 ≈ 0,34 = 34%"* (34=svar). Foreslå *"Tip: del 24 med 70 og gang med 100."*
- **sub-08** (100 − ___ = 37): nu *"hvis 100 minus noget giver 37, er det noget = 100 − 37"* (trivielt). Foreslå *"Tip: hvad skal trækkes fra 100 for at lande på 37?"*

---

## ⚠️ Prioritet 2 — Manglende dækning af kendte Ismail-svagheder

**ligninger.ts — mangler "x på begge sider":**
- Ismail fejlede 8.2/8.3 i FP9-prøven på dette
- Tilføj 1-2 opgaver som `2x + 3 = x + 8` eller `5x − 4 = 3x + 6`
- Forslag: erstat lig-09 (`4x + 8 = 32`) med `2x + 3 = x + 8` eller tilføj som lig-13

**koordinatsystem.ts — mangler punkt med negativ koordinat:**
- Ismail læste `(7, −4)` som `(−4, 7)` i prøven
- Tilføj mindst 1 opgave hvor eleven skal aflæse et punkt med negativ x eller y
- Forslag: erstat én af de 4 "y = ax + b ved x =..."-opgaver

---

## ⚠️ Prioritet 2 — Visuel polish

### Layout-shift på Quiz-knap

Visual-agent fandt at "Svar"-knappen bevæger sig 36px når man taster, og 41px mere når Enter trykkes. Bør stå på samme position. Skal undersøges yderligere — sandsynligvis noget i FeedbackOgKnap eller form-padding.

### Stagger-animation langsom

Dashboard fader 11 kort ind med 0.03s delay pr. kort = 330ms total. På re-visits opleves det som flimren. Reducér til 0.02s eller skip stagger på re-visits.

### NameInput er for subtil

`text-slate-300` placeholder kan let overses. Tilføj subtil baseline (`border-b border-slate-200`) i ikke-focus-tilstand så det ligner et input.

---

## 💡 Prioritet 3 — Idéer til fremtid

- **Tabel-træner-link** (gangetabeller) er beskeden — kunne være en 12. disciplin med "Værktøj"-styling
- **Progress-bar** på Quiz fylder hele skærmens bredde — bør være `max-w-xl mx-auto` for konsistens
- **Score-skærm "Tag igen"-knap**: mørk slate er ikke specielt CTA-agtig — kunne være emerald (matchende prøveklar) eller rose hvis under 50%
- **Eksport-toast** kunne inkludere filnavnet ("`fp9-progress-2026-05-03.json` blev gemt") frem for kun "tjek Downloads-mappen"
- **"Kommer snart"-prøveklar** er stadig klikbart — kunne være `pointer-events-none` for ren visuel signal

---

## 📋 SMAG.md — 5 nye principper foreslået

Ud over de eksisterende, tilføj under "Pædagogik & sprog":

1. *"Hvis tippet anvender opgavens egne tal, skal det stille det som spørgsmål eller metode-handling — ikke som beregning. ✅ 'hvor mange er røde af i alt?' / ❌ '3 ud af 5 = 60%'."*

2. *"Inden for samme disciplin: vælg én metode pr. opgavetype og brug den konsistent på tværs af opgaver. (Eksempel: brøk → procent skal bruge samme tankegang i alle opgaver, ikke skifte mellem 1/4-kæde og nævner-100-trick.)"*

3. *"Tip må ikke introducere ny notation eller fagord. Hvis et fagord er nødvendigt (fx 'median', 'typetal', 'omkreds'), brug det som FP9 kalder det og forklar i opgave-teksten — ikke i tippet."*

4. *"Tip skal være eksplicit om hvilket tal der bruges hvor — undgå pladsholdere som 'noget'. ❌ 'del med noget' / ✅ 'del med 5'."*

5. *"Banker skal vægte typer hvor klassen er svag — ikke uniformt fordele sværhed. Mindst 2/12 opgaver bør direkte ramme en kendt svaghed (Ismail: 'x på begge sider', negativ-koordinat-aflæsning, indsætnings-opgaver)."*

---

## ✅ Det der virker — bevar

- Touch-effect-disciplin (`hoverOnlyWhenSupported`, `-webkit-tap-highlight-color`, ingen "klistrende" hover)
- Keyboard-aware sider (`h-[100dvh] overflow-hidden`)
- iOS Tjek-knap på lektion (numeric keypad har ingen Return)
- `clamp()` til responsive grid (lektion)
- Dansk hyphenering på lange titler (`break-words hyphens-auto` + `lang="da"`)
- Vertikal centering på korte sider (`flex-1 flex justify-center`)
- Greyed-out for `kommerSnart` (`opacity-60 grayscale`)
- aria-labels på alle interaktive elementer
- Score-skærm med detaljeret opgave-oversigt
- 156 svar matematisk verificeret korrekt

---

## Hvordan handoff'en bruges

**Næste session:** Læs CLAUDE.md, PROEVE-PREP.md, SMAG.md, denne AUDIT.md, BACKEND-TJEK.md (i den rækkefølge).

**Anbefalet rækkefølge:**
1. Fix prioritet 1 (1.1-1.4) — ~30-45 min
2. Verifér med visual-reviewer-agent at quiz-bug er ude af verden
3. Fix prioritet 2 forklaringer (sandsynlighed-fil + de 8 specifikke) — ~45-60 min
4. Verifér med forklaringer-reviewer-agent
5. Tilføj manglende dækning (lig + koo) — ~20 min
6. Visuel polish (layout-shift, stagger, NameInput) — ~20-30 min
7. Opdatér SMAG.md med de 5 nye principper
8. Verifér igen med alle 3 agents
9. Build + deploy til /share/

**Total estimat:** 2-3 timer for fuldt fix.

Brug agenterne efter behov — de er sat op til at fange tilbagegange og inkonsistenser.
