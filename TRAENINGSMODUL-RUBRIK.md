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

*Tom indtil vi laver første nye modul. Hver retning brugeren giver mig
oversættes til en regel her — i hans formulering, ikke min.*

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
