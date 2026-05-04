## Addition

> Status pr punkt opdateret 2026-05-04 mandag eftermiddag.
> ✅ = løst og verificeret af brugeren · ⚠️ = løst men ikke verificeret · ❌ = åbent · 🔮 = fase 3/4-arbejde

### Desktop:
1. ✅ "Tryk enter" linjen, skal måske op og under "her er et plusstykke"
> [!NOTE] Hint-knappen er nu kun på intro-1 og placeret under overskriften. Fjernet helt på senere faser.

2. ✅ Spacingen og størrelsesforholdet mellem "her er et plusstykke" og selve stykket er off. Jeg kan ikke sætte ord på præcis hvordan det skulle være. Jeg føler at det er en helt standard design ting
> [!NOTE] Overskrift max 32px (var 28), gap 24px. Brugeren bekræftet "meget bedre".

2b. ✅ spacing og alignment generelt ikke i orden. eksempel når man skal sige 4 + 4 mens 24 + 54 er stillet på hinanden. når man skriver 8 i input feltet er der et meget lille gap mellem bunden af 8 og et større gap mellem toppen af 8 og stregen over 8.
> [!NOTE] Padding-top på input presser tallet ned så bunden baseline-aligner med statiske tal. lg-variant tilføjet (text-7xl overflowede før). leading-none på top-tal.

3. ✅ Man skal have mulighed for at gå tilbage i animationerne
> [!NOTE] Tilbage-knap i header + ArrowLeft. Stages-model: Stage A går fase-for-fase, Stage B hopper til vis-horisontal-1 og rydder state. Bugs med godkendt-flag og broen-morph timer er fixet.

4. ✅ Efter man er kommet videre fra "vi sætter dem op over hinanden" ser det lidt off ud. Input linjen ser mærkelig ud ift. de andre linjer. Regnestykket ser ud til at være sjovt placeret.
> [!NOTE] Adresseret som bivirkning af alignment-pass (punkt 2b).

5. ✅ Man skal kunne komme videre med touch/klik hvis ikke det allerede
> [!NOTE] handleScreenClick virker på hele skærmen.

6. ✅ Når man svarer 78 til 24+54 er der en linje til venstre for 78, under + symbolet, som om der skulle have været et ciffer for 100-kolonnen
> [!NOTE] harHundrede-guard fjerner ResultCell ved !harHundrede.

7. ⚠️ Næste regnestykke har samme problemer
> [!NOTE] Refererer til 2/2b/3/4 som er løst. Skal verificeres at det også gælder for 67+78 visuelt.

8. ❌ Jeg ved ikke om vi har løst den helt, når man skal svare på første kolonne i 67 + 78. Hvis man skriver 5 først og får beskeden "du vidste det", så føler jeg man har sluppet liiidt for nemt. Jeg synes der skal åbne sig et felt over 6, hvor man selv skal skrive 1.
> [!NOTE] Submit accepterer stadig både 5 og 15. Kræver eksplicit '1' i mente-felt over 6'eren — fase 3-arbejde.

9. 🔮 Når man skal svare på 6 + 7 + 1, skal man måske først og fremmest skrive spørgsmålet så det starter med 1 (eller er det dumt?). Noget andet er at man måske kunne have nogle røde pile til venstre for (eller anden form for marker), som viser man lægger de tre tal sammen.
> [!NOTE] Fase 3 mente-redesign.

10. 🔮 Når man svarer "14" på 6 + 7 + 1, bliver 14 crammed på 10'ernes plads. Det er grimt.
> [!NOTE] Fase 3 — løses når 14 splittes synligt (1 hundrede + 4 tier mens eleven taster).

11. 🔮 "Du har lært det" → progressiv 5 stk 2-cifret + 5 stk 3-cifret + FP9-lign
> [!NOTE] Fase 4. Stort koncept-arbejde.

### Mobil:
> Mobil-tjek venter — alt arbejde i dag har været desktop. Mobil testes når desktop er fuldt låst. Brugeren har sagt "vi venter med mobil".

1. ⏸ "Her er et plusstykke" skærmen ser lækker og indbydende ud. Måske skal teksten være lidt mindre så den ikke er så bred?

2. ⏸ Tryk for at fortsætte skal være længere oppe og forsvinde når man trykker. Det skal i øvrigt ikke kun trigges ved at trykke der, men på hele skærmen
> [!NOTE] Hint er nu fjernet på alle ikke-intro faser, og placeret under overskriften i intro. Klik-overalt virker. Mangler verificering på mobil.

3. ⏸ Spacing + størrelser — pro standards
> [!NOTE] Adresseret på desktop. Skal verificeres på mobil.

4. ⏸ Når 24 på 54 bliver oplistet og man skal svare på 4 + 4, ser det heller ikke ordenligt ud
> [!NOTE] Adresseret som del af alignment-pass. Skal verificeres på mobil.

5. ⏸ Er ikke så vild med "tjek" knappen. Skal man ikke bare kunne trykke på skærm for at tjekke. Hvad sker der egentlig hvis man svarer forkert?
> [!NOTE] Tjek-knap er pålagt af SMAG.md (iOS numeric keypad har ingen Return). Forkert-svar er fixet ("Prøv igen" i amber, 2 sek). Tjek-vs-skærm-konflikt er stadig åben — diskussion påkrævet.

6. ⚠️ Når man skal svare på 2+5 er der en linje under "+" tegnet
> [!NOTE] Sandsynligvis fixet (samme bug som desktop 6). Skal verificeres på mobil.

7. (note fra brugeren: skipper duplikater fra desktop)

8. ❌ Når man kommer videre til 67 + 78 er der en lille underlig streg under stykket i det første sekund
> [!NOTE] Mistanke: motion-flicker mellem ex1→ex2 streg-fadeout/in. Ikke verificeret. Brugeren vil have det fanget automatisk.

9. ❌ Hvis man skriver "1" under 7+8 i 1-er kolonnen, så rykker input linjen sig op
> [!NOTE] Anti-pro fejl. Måske bivirkning af line-height shift. Mobil-test required.
> [!IMPORTANT] Brugeren har gjort denne til en META-regel: "helt basale anti-pro design / udvikler ting burde fanges eller slet ikke kunne laves. Hvis det er et framework spørgsmål, skal man overveje at ændre framework." Skal addresseres som regel i visual-reviewer-agent.

10. 🔮 Hvis man svarer 15 under 7+8 — bedre forklaring + animationer underlige
> [!NOTE] Fase 3 mente-redesign.

---

## Meta-regler fanget i denne session

Disse er noteret i deres respektive docs så fremtidige fixes fanger dem automatisk:

1. **"Sekventielt, ikke parallelt: ting der forsvinder skal være væk FØR ting der ankommer"** — `ANIMATIONER.md` Regel 5.
2. **"Hint på efterfølgende faser er passiv-aggressiv UI"** — allerede i `SMAG.md` (klik-overalt-reglen). Vi anvender det nu konsekvent: hint kun ved intro.
3. **"Hint placeres på midtpunktet af spacet under primært indhold"** — design-princip for primær-handling-zone.
4. **"Anti-pro skal fanges automatisk"** — venter på opgradering af visual-reviewer-agent (todo).
