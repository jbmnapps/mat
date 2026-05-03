# Product

## Register

product

## Users

9.-klasses elever der træner FP9 Matematik uden hjælpemidler hjemmefra op til prøven mandag 4. maj 2026. De arbejder typisk alene foran en skærm i kortere sessioner — ikke i en undervisningskontekst. De har varierende niveau og varierende motivation. Nogle vil vide hvor de står; andre vil bare blive færdige.

Sekundært: læreren der deler appen ud til klassen og bruger en oversigt til at se hvem der har trænet hvad.

## Product Purpose

Hjælper eleven med at træne FP9-disciplinerne fokuseret op til prøven, og at forstå hvor han står lige nu (rød/gul/grøn pr. disciplin, baseret på bedste prøveklar-score).

Tre modes pr. disciplin: **Lektion** (lær det), **Træning** (øv det), **Prøveklar** (test det). Eleven kan retage prøveklar uendeligt — bedste tæller. Status opdateres automatisk og synkroniseres på tværs af enheder via Supabase.

Succes: eleven får et håndgribeligt overblik over egen parathed, kan målrette sin træning til de svage discipliner, og møder mandag 4. maj 2026 mere forberedt end uden appen.

## Brand Personality

Overskuelig, premium, intuitiv, interaktiv, overblik-givende, responsiv.

Det skal føles som et velbygget redskab — ikke en læringsplatform, ikke en gamification-app, ikke et skoleadministrativt system. Tonen i UI er knap og direkte (FP9-imperativ: "Udregn", "Hvor meget...", "Vælg én"). Visuelt fundament arvet fra det oprindelige print-projekt: Quicksand display, Inter body, Georgia italic til subtitler, SVG-mønstre, rolige funktionelle animationer.

Stemningen: en elev åbner appen, ser med det samme hvor han står, går ind i en disciplin, og *vil* bruge de interaktive illustrationer fordi de er sjove at røre ved — ikke fordi læreren har sagt det.

## Anti-references

- **AI-genereret æstetik** — generiske gradient-cards, hero-metric-templates, identiske kort-grids, "modern SaaS"-cream. Hvis nogen kan se på interfacet og sige "AI lavede det", er det fejlet.
- **Lavkvalitets edu-platforme** — det grafiske udtryk fra Lectio, MinUddannelse, Matematikfessor og lignende. Tunge menuer, generiske ikoner, billig stockfotografi, tekst-tunge sider.
- **Gamification-overdrev** — Duolingo-streaks, badges, konfetti, mascotter, "level up!"-popups. Vi forstærker mestring, ikke dopamin.
- **Skole-administrativt look** — tabeller med farvede statusprikker, "kompetencemål"-bjælker, blå header med logo i venstre hjørne. Det skal ikke ligne et lærerværktøj selv om læreren også bruger det.

## Design Principles

1. **Premium gennem håndværk, ikke effekter.** Kvaliteten ligger i interaktioner, finish og forudsigelighed — ikke i flashy gradients eller animationer for animationens skyld. Hvis en effekt ikke tjener forståelsen, ryger den.

2. **Overblik først, detaljer på forespørgsel.** Eleven skal kunne se sin parathed (rød/gul/grøn pr. disciplin) på under et sekund efter login. Komplekse detaljer (historik, score-fordeling, distraktorer) ligger ét klik væk, ikke ovenpå.

3. **Interaktive illustrationer er kerne, ikke pynt.** Visualiseringer kan manipuleres — drag, slider, animér. Eleven leger med talene, ikke kun ser dem. Det er den centrale differentiator fra alle andre FP9-træningsmaterialer.

4. **FP9-sproget er produktets sprog.** Knappe imperativer, dansk, samme tone og ordlyd som selve prøven. Også i UI: "Udregn", "Hvor meget...", "Næste opgave". Aldrig "Tjek dit svar nu! 🎉".

5. **Forudsigelighed er en feature.** Samme handling giver samme effekt hver gang. Status opdateres efter samme regel hver gang. Knappen sidder samme sted på hver disciplin-side. Eleven skal ikke gætte.

## Accessibility & Inclusion

- WCAG 2.1 AA som baseline (kontrast, fokus-states, semantisk HTML).
- `prefers-reduced-motion` respekteres — alle bevægelser skal have en statisk fallback der bevarer informationen.
- Tastatur-navigation virker på alle interaktive elementer (inkl. illustrationerne).
- Math-input bruger `<input type="text" inputmode="decimal">` — aldrig `type="number"`, der dræber komma på dansk tastatur.
- Sproget er udelukkende dansk — UI, opgaver, fejlbeskeder.
- Designet skal virke desktop-først, men være responsivt så elever der træner på mobil eller tablet ikke straffes.
