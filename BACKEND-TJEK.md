# Backend-tjekliste (Supabase + login)

> Framework for hvad du som lærer skal tænke over og spørge om, så vi sikrer at eleverne ikke mister progress, at sikkerheden er passende for konteksten, og at setup'et er professionelt for situationen — ikke fancy, men robust.

Doc'et er skrevet til weekend-sprintet (FP9 2026-05-04). Slettes / arkiveres efter mandag. Ikke til main.

---

## 1. Progress — mister eleverne data?

**Hovedrisiko:** at vi gør Supabase til "single source of truth" og noget går galt → progress væk.

**Spørg mig:**
- Er det offline-first? *(Det skal det være: localStorage er kilden, Supabase er kopi. Hvis netværket dør midt i en træning, fortsætter de uden hak.)*
- Hvad sker hvis to enheder syncer på skift — kan progress blive overskrevet med ældre data? *(Løsning: merge på "højeste best_score wins", ikke last-write-wins.)*
- Hvad sker hvis en elev rydder browser-data? *(Med login: log ind → progress hentes fra Supabase. Det er pointen.)*
- Tager Supabase backup automatisk? *(Free-tier nej. Jeg laver et lille script så du kan eksportere SQL-dump fra dashboard på 30 sek hvis du er nervøs.)*

**Det jeg håndterer uden at spørge:** localStorage som primær kilde, Supabase som mirror, retry-ved-fejl, "merge max-score" ved konflikt.

---

## 2. Sikkerhed — kontekstualiseret

Det her er et klasse-værktøj for ~25 elever, ikke en bank. Sikkerheden skal være proportional.

**Spørg mig:**
- Bruger vi RLS (Row Level Security) på Supabase? *(Ja. Uden RLS er anon-key et åbent hul. Med RLS kan en elev kun røre sin egen række.)*
- Hvad er lærer-token og hvor stærk er den? *(Skal være 32+ tilfældige tegn, ikke noget jeg selv finder på. Hvis den lækker, roterer vi den ved at ændre env-var og redeploye — 2 min.)*
- Kan en elev "hacke" en anden elevs progress? *(Med 4-cifret kode kan teknisk gættes på 10.000 forsøg. I praksis: ingen 9.-klasses elev gider. Hvis du er bekymret kan vi tilføje rate-limit eller 6 cifre. Min anbefaling: drop det, det er overengineering for konteksten.)*
- Står anon-key i public kode? *(Ja, det skal den. Den er designet til at være public. Den faktiske sikkerhed sidder i RLS-reglerne.)*

**Det jeg håndterer:** RLS-policies i SQL, generering af lærer-token, ingen `dangerouslySetInnerHTML`, parameteriserede queries (Supabase-clienten gør det automatisk).

**Det du skal vide:** anon-key i public repo er ikke en fejl. Hvis nogen siger "men de kan se din key i devtools" — det er meningen. Sikkerheden er på serveren.

---

## 3. Compliance — eleverne er mindreårige

**Spørg mig:**
- Hvad gemmer vi om dem? *(Kun fornavn (de kan vælge et fake-navn) + kode + progress. Ingen email, ingen efternavn, ingen IP, ingen tracking.)*
- Bryder det skolens regler? *(Det skal du vurdere. Lavt risikoniveau, men hvis din skole har strenge GDPR-regler bør du nævne det for ledelsen mandag.)*
- Kan jeg slette en elev hvis forældre beder om det? *(Ja. 5 sek i Supabase dashboard. Jeg viser dig hvor.)*
- Skal data slettes efter prøven? *(Anbefaling: ja, slet alt fredag efter prøven. Jeg kan lave et lille knap-flow til dig hvis du vil.)*

**Du beslutter:** Skal eleverne bruge fornavn eller pseudonym? Mit råd: bed dem om at vælge et navn de selv kender, ikke nødvendigvis fornavn. Så ved de hvem der er hvem på lærer-siden uden at det er identificerbart for andre.

---

## 4. "Professionelt for situationen"

Professionel betyder ikke "fancy". Det betyder "fejler gracefully og er let at forstå".

**Spørg mig:**
- Hvad sker hvis Supabase er nede i 5 min? *(Eleverne kan stadig træne. localStorage virker. Når Supabase kommer tilbage, syncer det automatisk.)*
- Hvad sker hvis en elev får en fejl? *(Tydelig dansk besked, ingen stack traces. Fx "Kunne ikke gemme — tjek dit internet" med en knap "Prøv igen".)*
- Hvordan ved du som lærer at det virker? *(Lærer-siden viser "sidst aktiv: for 5 min siden" pr. elev. Hvis ingen er aktive selvom du ved de træner: noget er galt.)*
- Hvad gør du hvis du selv bliver låst ude? *(Jeg giver dig direct DB-adgang via Supabase dashboard som backup. Du kan altid se rådata uanset hvad.)*

**Det jeg håndterer:** error boundaries, dansk fejltekst, retry-knapper, "synker..." indikator i UI så eleven ved at progress er gemt.

---

## 5. Kommunikation til eleverne (ikke teknisk, men kritisk)

**Tænk på:**
- Hvad sender du dem sammen med linket? Forslag: *"Vælg et navn (fornavn eller andet) og en 4-cifret kode. Skriv koden ned så du kan logge ind igen i morgen. Hvis du glemmer den, sig til på mandag."*
- Hvad gør de hvis de glemmer kode mellem lørdag og søndag? *(De starter forfra med nyt navn. Du kan slette duplikatet senere.)*
- Skal du teste det selv FØRST? *(Ja. Du laver "TestElev" + "0000", trykker dig igennem en træning, og ser at det dukker op på `/laerer`. Først DA sender du linket ud.)*

---

## 6. Tjekliste før du deler linket

Spørg mig disse seks spørgsmål, og forlang ja til alle:

1. Har du verificeret at progress overlever logout/login lokalt?
2. Har du kørt security-review-agenten over diff'en?
3. Har du testet at lærer-siden viser den rigtige data?
4. Hvad sker hvis Supabase er nede — har du simuleret det?
5. Hvad er fallback hvis en elev får en hård fejl midt i prøveklar?
6. Hvor er env-vars gemt, og hvem har adgang?

Hvis jeg ikke kan svare ja til alle 6, deler du ikke linket endnu.

---

## 7. Bottom line

Den her opsætning er rimelig for konteksten hvis vi:

- gør localStorage primær, Supabase sekundær
- bruger RLS på alle tabeller
- har dansk fejlhåndtering
- tester ende-til-ende før deling

Det er ikke "Anthropic-grade", men det er pænt for en weekend-app til 25 elever.

---

## 8. Efter prøven (mandag/tirsdag)

- Eksportér evt. SQL-dump som arkiv (hvis du vil have klassens data til senere refleksion)
- Slet rå-data i Supabase fredag efter prøven
- Roter eller slet lærer-token
- Cherry-pick relevant kode til main, men IKKE denne fil eller PROEVE-PREP.md
