# Animationer — tekniske regler og faldgruber

> Levende dokument. Tilføj nye regler når en animation-bug har kostet tid og det
> er sandsynligt at andre kan ramme samme problem.
>
> Designprincipper (om hvordan animationer skal **føles**) ligger i `SMAG.md`.
> Denne fil handler om **hvordan vi implementerer dem korrekt**.

---

## Stack

- **Motion** (tidligere Framer Motion) til komponent-animationer
- **CSS transitions** når Motion ikke er det rigtige værktøj
- `prefers-reduced-motion` skal respekteres (Motion gør det automatisk; CSS-transitions skal håndteres manuelt)

---

## Regel 1 — Motion kan ikke interpolere mellem unit-typer

**Symptom:** En animation laver et "hak" — den snapper til en mellemtilstand før den lander på destinationen.

**Årsag:** Motion's `animate`-prop kan ikke smoothly interpolere mellem værdier af forskellige unit-typer. Eksempel: animere `y` fra `'-50%'` til `'calc(-100% - 160px)'` blander procent og calc-string med pixel-offset. Motion kan ikke regne en mellemtilstand ud, så den snapper.

**Løsning:** Brug CSS-transition direkte i `style`:

```tsx
<motion.div
  initial={false}
  animate={{ fontSize: ... }}  // motion håndterer fontSize fint
  style={{
    transform: erIntro
      ? 'translate(-50%, -50%)'
      : 'translate(-50%, calc(-100% - 160px))',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  }}
>
```

Browseren kan interpolere `transform`-værdier smooth uanset units. Behold Motion til ting som `opacity`, `scale`, `fontSize` der har samme unit-type.

**Eksempel hvor det blev løst:** `components/lektion/addition-interactive.tsx` — overskrift-overgang fra intro til aktiv.

---

## Regel 2 — Nye elementer skal træde ind med delay når andet flytter sig

**Symptom:** Et nyt element dukker op oveni et eksisterende element, eller overlapper det mens det flytter sig.

**Årsag:** Hvis et nyt element renderer samtidigt med at et eksisterende element er midt i en bevægelsesanimation, kan de ende på samme position et øjeblik = overlap-rod.

**Løsning:** Giv det nye element en `delay` der svarer til det eksisterende elements bevægelses-varighed (typisk 200-400ms):

```tsx
<AnimatePresence>
  {visFormula && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
    >
      <FormulaScene />
    </motion.div>
  )}
</AnimatePresence>
```

**Eksempel hvor det blev løst:** Plusstykket der dukkede op oveni "Her er et plusstykke" mens overskriften prøvede at flytte sig op.

---

## Regel 3 — `AnimatePresence mode="popLayout"` overlapper absolut-positionerede børn

**Symptom:** To tekster overlapper hinanden synligt i ~200ms under et tekst-skift med `<AnimatePresence mode="popLayout">`.

**Årsag:** `popLayout` tager exit-elementet ud af layout-flowet og positionerer det `absolute`. Hvis både entering og exiting element er positioneret på samme sted (fx begge i samme container med `text-center`), bliver de set oveni hinanden.

**Løsning:** Brug enten `mode="wait"` (gammel exit'er fuldt før ny enter'er) eller skift fra cross-fade til instant unmount + fade-in via key-change:

```tsx
<motion.span
  key={beskedTekst}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  {beskedTekst}
</motion.span>
```

Når `key` ændres, gammel element unmountes instant og nyt element fader ind. Ingen AnimatePresence nødvendig hvis der ikke skal være exit-animation.

---

## Regel 4 — `transition` på et `<AnimatePresence>`-barn gælder for ALLE faser

**Symptom:** En animation har `delay: 0.5s` på entry, men exit-animationen venter også 0.5s før den begynder. Element bliver hængende synligt efter en fase-overgang.

**Årsag:** Når `transition` er sat som top-level prop på en motion-component, gælder det for `initial → animate`, `animate → exit`, alt. Hvis du vil have forskelligt timing, skal du eksplicit specificere transition på `animate` og `exit` separat.

**Løsning:**

```tsx
<motion.div
  initial={{ opacity: 0, scaleX: 0 }}
  animate={{
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.4, delay: 0.5 },
  }}
  exit={{
    opacity: 0,
    transition: { duration: 0.2 },  // ingen delay på exit
  }}
/>
```

**Eksempel hvor det blev løst:** Den horisontale streg under opstillingen der "spawn'ede" og forsvandt 1 sekund efter fase-skift.

---

## Regel 5 — Sekventielt, ikke parallelt: ting skal forsvinde FØR de næste ankommer

**Symptom:** Når man navigerer mellem to faser, sidder det gamle element synligt mens det nye allerede er i gang med at glide ind eller flytte sig — de "clasher" i overlap-perioden.

**Årsag:** Begge animationer (exit på det gamle, enter/move på det nye) trigges af samme state-skift og starter ved T=0. Selvom durations er forskellige, overlapper de i åbningssekunderne.

**Løsning:** Lav en koreografi: exit først, kort pause, enter/move bagefter. Tre konkrete patterns:

1. **Hurtig exit, derefter enter med delay** — exit ~150-200ms, enter med `delay` der svarer til exit-varigheden:
   ```tsx
   exit={{ opacity: 0, transition: { duration: 0.18 } }}
   animate={{ opacity: 1, transition: { duration: 0.35, delay: 0.2 } }}
   ```

2. **CSS transition-delay på det element der skal flytte sig** — hvis exiting-elementet er en AnimatePresence-child og moving-elementet er en motion.div, læg en delay på moving-elementet's transition så det venter på exit:
   ```tsx
   style={{
     transition: `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${gårTilbage ? '0.2s' : '0s'}`,
   }}
   ```
   Den konditionelle delay matcher retning — kun forsink når der er noget der skal exit'e først.

3. **Tag tidslinjen ned i en kommentar** når sekvensen er svær at se i koden alene.

**Hvorfor det er vigtigt:** Brugerens regel — *"ting der forsvinder skal være væk før ting der ankommer"*. Parallelle animationer føles billige; sekventielle føles pro. Det er én af de "anti-pro skal fanges automatisk"-faldgruber: hvis to animationer kører samtidigt og kan ende oveni hinanden, er det per definition forkert design.

**Eksempel hvor det blev løst:** Tilbage-navigation i `addition-interactive.tsx` — når eleven gik fra aktiv-mode tilbage til intro, ramte overskriftens tekst plusstykket før det fadede væk.

---

## Sekvenser med flere animationer

Ved fase-skift hvor flere ting skal animere i sekvens (overskrift rykker → tekst skifter → mente lander → result lander), brug eksplicitte `delay`-værdier til at koreografere rækkefølgen:

```
T=0     fase skifter
T=0     overskrift starter y-animation (300ms)
T=0     tekst exit (120ms)
T=200   tekst enter (180ms)
T=380   overskrift færdig
T=550   mente '1' starter spring (delay 0.55s)
T=700   '5' starter spring (delay 0.7s)
```

Hvis sekvensen er svær at få til at se naturlig ud, skriv tidslinjen ned i en kommentar i koden så fremtidens session forstår intentionen.

---

## Hvordan denne fil vokser

Hver gang en animation-bug har kostet mere end 30 minutter og fixen er ikke umiddelbart åbenlys, tilføj en regel her. Format: **Symptom**, **Årsag**, **Løsning**, **Eksempel hvor det blev løst**.
