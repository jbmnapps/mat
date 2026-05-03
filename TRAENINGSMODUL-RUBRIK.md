# Træningsmodul-rubrik — levende dokument

> Denne fil er rubrikken for hvad et godt træningsmodul er i FP9-projektet.
> Den starter tom og bygges op mens vi arbejder, én iteration ad gangen.
>
> **Princip:** Når brugeren retter mig, oversætter jeg *intentionen* til en
> regel her — i hans sprog, ikke mit. Næste modul starter med at anvende
> rubrikken automatisk.
>
> Læses ALTID før et træningsmodul røres eller tilføjes.

---

## North Star

> **ALT i appen skal pege på at eleven lærer undervejs. Opgaver bygger
> færdigheder, terper dem, og bygger bro mellem sværhedsgrader — så
> effektivt som muligt.**

Et modul der ikke peger den vej, hører ikke hjemme i appen.

---

## 3-lag-modellen

Hver disciplin har op til tre lag. Lagene er separate moduler, men deler
disciplin-id, farve og terminologi.

### Lag 1 · Lektion-træning *(eleven lærer metoden)*

Interaktiv læringsoplevelse. Bygger på `addition-interactive.tsx` som mønster.
Eleven manipulerer tal, ser animationer, gennemgår en metode trin for trin.
Ingen "test" — kun learning by doing.

**Krav:**
- Step-by-step fase-baseret state-maskine
- Visuelle elementer der manipuleres (drag, slider, animation)
- Forklaring opstår *gennem* interaktion, ikke som tekstbox
- Slutter når eleven har gennemført metoden mindst én gang

**Ikke en lektion:** statisk tekst med "her er reglen" + tre øvelser.

### Lag 2 · Terpe-opgaver *(eleven træner færdigheden)*

Isolerede sæt af samme type opgave. Eleven vælger sværhedsgrad eller variant
("Addition · 3-cifre", "Addition · 2-cifre", "Addition · hverdagsspørgsmål").
10 ad gangen. Hint-knap giver step-for-step støtte. Quiz-stil, men hver
underkategori er ren — ingen blanding indtil eleven mestrer hver del.

**Krav:**
- Eleven kan vælge variant inden for disciplinen
- Hver opgave bygger bro fra forrige (se "byg-bro" i `PRINCIPPER.md`)
- Hint før svar (ikke kun efter forkert svar)
- 10-12 opgaver pr. variant

### Lag 3 · FP9-replika *(eleven måler sig)*

Replikering af FP9-prøvesæt på sværhedsgrad og opgave-typer pr. disciplin.
Eleven kan ikke ramme samme kombination som rigtig prøve, men vi giver et
bud der ligger tæt på prøvebanken.

**Krav:**
- Match FP9-niveau præcist (se `Elevprøver_FP9guidelines/`)
- Ingen hints inde i opgaven (det er prøve-simulation)
- Efter hver opgave: lille marker *"hvad du skal øve for at kunne det her"* der peger til lag 1 eller 2 i den/de relevante disciplinerne
- Ingen tidsmåling i v1; måske senere

---

## Hard rule — ikke-brydende ændringer

Eleverne bruger appen LIVE på `https://jbmnapps.github.io/mat/`. Et nyt modul må aldrig:

- Ændre formen på localStorage/Supabase progress-data
- Fjerne eksisterende routes eller knapper de er midt i at bruge
- Kræve ny login eller re-import for at fortsætte

Tilføj nyt indhold parallelt. Slet eller omdøb først efter et modul har erstattet den gamle vej, og brugerens progress er sikret. Detaljer i CLAUDE.md "Live-site beskyttelse".

## Bærende regler *(opdateres løbende)*

### Vis, vis ikke fortæl
*Tilføjet 2026-05-03 efter gennemgang af addition-lektionen.*

**Reglen:** Det vigtigste begreb i lektionen skal læres gennem en **visuel handling** eleven ser eller selv udfører — ikke gennem en sætning der beskriver handlingen.

**Hvorfor:** Addition-lektionen viste det modsatte — menten blev "forklaret" ved at et 1-tal poofer ind oven over et ciffer, mens en sætning sagde "tieren flytter over". Men tieren flyttede ikke synligt nogen steder hen. Vi fortalte om bevægelsen i stedet for at vise den. En elev der ikke allerede kan stoffet, lærer intet af det. Hun bliver guidet gennem en kortere quiz, ikke en lektion.

**Hvordan:** For hvert lektion-modul (lag 1), identificér det centrale begreb — det ene "aha"-moment der bærer hele disciplinen. Spørg: *"hvilken bevægelse, animation eller manipulation gør denne idé synlig?"* Hvis svaret er "vi skriver en sætning der forklarer det", omformulér scenen indtil svaret er en visuel handling. Tekst er kun støtte; scenen er det lærings-bærende.

### Anti-pro skal fanges automatisk
*Tilføjet 2026-05-03 efter brugerens gennemgang af addition-lektionen.*

**Reglen:** Når basale designvalg går galt — layout-shifts, fantom-elementer, mismatched timing, ulæselige farver, crammed indhold — skal det fanges som *symptom* på at en ramme eller proces er forkert. Ikke kun som en bug.

**Hvorfor:** Brugeren mistede tillid til lektionen ikke fordi enkelte ting var forkerte, men fordi de virkede uprofessionelt. Han forventer at jeg selv ser det og siger *"det her er sgu ikke godt nok"* før han ser det. Hvis jeg lader basale ting passere, skubber jeg vurderings-byrden over på ham.

**Hvordan:** Før push, se på det med "fremmedøjne". Hvis du selv ville rynke brynene som bruger, så fortæl det — også hvis det betyder at scope vokser. Hvis det er framework- eller arkitektur-valg der gør det svært at undgå basale fejl, sig det højt. Aldrig accepter "det fungerer godt nok" som svar på noget der visuelt ikke holder.

### Layout må aldrig hint at noget skal udfyldes der ikke skal
*Tilføjet 2026-05-03 efter brugerens fund af "fantom-kolonne 3"-stregen.*

**Reglen:** Visuelle pladsholdere (linjer, bokse, tomme felter) må kun vises hvis de modsvarer en handling eleven skal udføre. Et 5-søjlet grid der reserverer plads til 100-kolonnen i et 2-cifret stykke er en koncept-bug — ikke et visuelt bug.

**Hvorfor:** Eleven læser visuelle hints som instruktioner. Hvis der er en streg under en tom plads, tror hun at noget skal stå der. Det forvirrer fra den faktiske opgave.

**Hvordan:** Tilpas grid og scene-elementer dynamisk til hvad opgaven faktisk kræver. 2-cifret addition viser 2 kolonner + 1 mente-position. 3-cifret viser 3 kolonner. Layoutet må gerne kunne *bære* op til 4-5 kolonner (for fleksibilitet), men kun *vise* dem der bruges.

### Klik avancerer overalt — Tjek-knap kun når der er flere mulige handlinger
*Tilføjet 2026-05-03.*

**Reglen:** I lektion-faser hvor eleven skal "fortsætte til næste trin", skal hele skærmen være klik-flade — ikke kun en specifik knap. En "Tjek"-knap er kun nødvendig hvis eleven har flere handlinger at vælge mellem (fx svare eller springe over).

**Hvorfor:** "Tryk her for at gå videre" som lille tekst nederst er passiv-aggressiv UI. Det reducerer momentum og tvinger eleven til præcision-mus-arbejde. Hele scenen er konteksten — den skal være interaktionen.

**Hvordan:** I avance-faser: lyt til klik på et large baggrunds-div + Enter på tastatur. Hint-tekst kan vises subtilt, men er ikke den eneste klik-flade. I input-faser hvor eleven har taster i, behold submit-knap (iOS-keypad har ikke return). Hvis der ER en knap (fx fejl-handling med "prøv igen"), skal den være tydelig CTA, ikke et lille link.

### Forkert svar = prøv igen + bedre forklaring. Aldrig "dit svar accepteres bare"
*Tilføjet 2026-05-03.*

**Reglen:** Når eleven svarer forkert, skal modulet (a) tydeligt vise at svaret var forkert, (b) give en visuel forklaring der hjælper hende videre, (c) lade hende prøve igen med samme opgave. Aldrig acceptere et "tilstrækkeligt nært" forkert svar som rigtigt for at undgå friktion.

**Hvorfor:** Eksisterende addition-lektion accepterer både "5" og "15" som svar på 7+8 — den ene er den rigtige tankegang (forstår mente), den anden er det rå svar. Det føles som om vi skåner eleven, men reelt: vi springer over det vigtigste lærings-moment. Eleven der svarede "15" har ikke forstået menten endnu — det skal være en pause-og-vis-momentum, ikke et "du vidste det".

**Hvordan:** Definér det forventede svar pr. fase præcist. Forkert svar → shake + ryd input + animeret forklaring + "prøv igen". Ikke "accepter forkert-men-tæt-på".

### Lektion ender ikke — den bygger bro ind i træning
*Tilføjet 2026-05-03.*

**Reglen:** En lektion afsluttes ikke med "du har lært det" og en knap til "Start træning". Lektionen *fortsætter* ind i progressiv træning: små bidder med stigende sværhed, indenfor samme session, så eleven mærker at hun går fra "lige forstået" til "kan bruge det" uden brud.

**Hvorfor:** Den klassiske skole-struktur ("nu har du lært det, gå hjem og øv") taber den svage elev. Hun har lige set det ene gang. Hun skal bruge det STRAKS, mange gange, i stigende sværhed. Først der bliver det fast.

**Hvordan:** Efter "lektion-delen" (gennemgang af metoden), lad eleven løse 5 lette opgaver i samme stil som lektionen. Tilbyd så 5 mere eller skift til næste sværhedsgrad. Slut på en FP9-lign opgave hvor metoden anvendes på en virkelig prøveformulering — gerne med visualiseret oversættelse fra problem-tekst → opstilling → svar. Eleven skal mærke en kontinuerlig opbygning, ikke en eksamen-til-træning-overgang.

### Eleven skal kunne navigere frem og tilbage
*Tilføjet 2026-05-03.*

**Reglen:** I alle interaktive moduler (lag 1, 2, 3) skal eleven kunne gå tilbage til forrige trin/opgave/fase og frem igen. Aldrig fanget på en skærm hun ikke ville være.

**Hvorfor:** Eleven kan have misset noget. Eller hun vil tjekke et tidligere svar. Eller hun trykte for hurtigt. Hvis hun ikke kan gå tilbage, skal hun starte forfra — det dræber både tålmodighed og læring.

**Hvordan:** Pile-knapper (← →) i header eller header-area. Tastatur-shortcuts (← →). Bagud bevarer state (input, svar). Frem efter bagud genoptager hvor man var. Aldrig tab af progress ved navigation.

### Format på regel-tilføjelser

```
### [navn på reglen i én sætning]
*Tilføjet [dato] efter [hvilken opgave/situation]*

Reglen: [konkret formulering]
Hvorfor: [intentionen — hvad rammer reglen?]
Hvordan: [konkret hvordan man anvender den næste gang]
```

---

## Lærings-log

*Hver iteration noteres her — hvad lærte vi, hvordan ændrede rubrikken sig.*

- *2026-05-03 v0:* Initial version, skelet med 3-lag og North Star.
  Ingen bærende regler endnu — første modul vil generere de første.
