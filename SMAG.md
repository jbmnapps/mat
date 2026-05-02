# Brugerens smag — levende dokument

> Det her er reglerne jeg har lært mig om brugerens smag, sprog og logik.
> Læses ved start af enhver UI- eller indholdsændring. Opdateres når brugeren
> retter mig. Aldrig statisk — voks med hver iteration.
>
> **Princip:** Når en regel kommer flere gange, hører den hjemme her, ikke i
> chatten. Brugeren skal aldrig sige det samme to gange.

## Pædagogik & sprog

- **"Skal føles overskueligt for en svag elev"** er det øverste filter.
  Hvis en svag 9.-klasse-elev ville rynke brynene, er det ikke godt nok.
- **Forklaringer skal være kort, direkte handling.** Format: *"først X, så Y"*.
  - ✅ "Tip: først 47 + 28. Læg så 19 oveni."
  - ❌ "Tip: læg de to første sammen først (47 + 28). Læg så 19 til."
  - ❌ "Tip: enerne giver 15 — husk mente 1 oppe i tier-søjlen."
- **Ingen matematisk jargon.** Ord som "ener-søjle", "tier-søjle", "mente",
  "decimal-position" er ikke OK i hints. Brug konkret handling.
- **Hints må aldrig afsløre svaret.** Direkte beregning er ikke OK.
  *"hvor langt fra 65 op til 100?"* er OK. *"65 + 35 = 100"* er ikke OK.
- **FP9-tone:** "Udregn", knappe beskeder, navne OK i word-problems.
- **Alt på dansk.** UI, fejlbeskeder, opgaver, tooltips. Engelsk kun i kode-identifikatorer.

## Visuelt design

- **"Pro" feel — designerblikket.** Spacing, størrelser og hierarki skal
  harmonere. Ingen elementer der dominerer uretfærdigt (fx input-tekst
  så stor at den overdøver spørgsmålet).
- **Mobile-first.** Design skal virke på iPhone først, derefter desktop.
  iPhone er primær platform fordi eleverne træner på telefon.
- **Ingen layout-shifts.** Elementer flytter sig ikke når feedback eller
  ny tilstand vises. Brug reserveret plads eller smooth animations
  (height 0 → auto med overflow:hidden).
- **Greyed-out for ikke-tilgængeligt.** Modes som ikke er bygget endnu
  (fx prøveklar) skal være visuelt markeret som inaktive.
- **Mindre er mere.** Fjern hvad der ikke giver elev-værdi. Subtitle
  *"Læg sammen på papir"* var overflødig — symbolet + navnet er nok.

## UX-flow

- **Tastatur må ikke overlappe indhold.** Brug `100dvh` og lad indhold
  centreres så det er læsbart selv med keyboard oppe.
- **Side må ikke blive scrollable** når der ikke er behov. Fixed-height
  layouts er bedre end auto-scroll.
- **Eleven skal kunne navigere frem og tilbage** i opgaver — uimplementeret
  endnu, men det er en regel når træningsflowet bygges videre.
- **PWA / fullscreen** er en plus — apple-touch-icon + meta-tags så
  det føles som en app, ikke en webside (kommer i ny iteration).

## Tone i bruger-feedback

- **Vag feedback = oversæt til intention.** "Det føles ikke pro" betyder
  *"spacing/sizing/hierarki er ikke rigtigt — fix det som en designer ville"*.
  Spørg ikke om eksakt fix; tag designerblikket på.
- **"Whatever, men det skal være pænt og i tråd med hvad gode designere gør"**
  = du har carte blanche til at lave gode designvalg. Ikke et spørgsmål om
  approval — bare lave det godt.
- **Princip-feedback** ("for kompliceret", "for abstrakt", "for langt") gælder
  bredt. Tag det med til ALLE lignende elementer, ikke kun det specifikke.

## Process (workflow)

- **Visual-tjek FØR push** på alle UI-ændringer. Lokal preview via
  `npm run dev` + Claude in Chrome. På sigt: visual-reviewer-agent
  der tjekker mod denne fil + DESIGN.md før push.
- **System over ad-hoc.** Når samme slags retning kommer to gange,
  hører den hjemme her — ikke kun i en konkret fix.
- **Selv-optimering.** Det her dokument vokser. Når jeg lærer noget,
  føjer jeg det til. Når noget viser sig at være forkert, fjerner jeg det.
  Bruger må gerne selv tilføje regler direkte.

## Konkrete eksempler (anti-mønstre der kostede tid)

- **"Din status"-pille øverst på dashboardet** — for visuelt støjfuld;
  blev erstattet af subtil progress-bar pr. disciplin.
- **Subtitle "Læg sammen på papir"** inde i kort — overflødig dekoration.
- **Layout-shift når "Forkert" dukkede op** — input + næste-knap flyttede
  sig. Fixed med `height: 0 → auto` animation + én knap der skifter rolle.
- **Input-tal `text-5xl` på mobil** — for stort, dominerede spørgsmålet.
  Reduceret til `text-4xl` på mobil.
- **`-mt-12` på score-skærm** — pulled "Du er færdig" oven på "Tilbage"-link
  på iPhone. Begrænset til lg-only.
