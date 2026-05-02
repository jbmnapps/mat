# FP9 Matematikopgaver — WEB version

Web-app der lader 9.-klasses elever træne FP9 Matematik uden hjælpemidler hjemmefra. Arvtager til print-projektet i `print/`.

## Sådan arbejder jeg

- **Intention før mekanik.** Hvad skal resultatet være — for brugeren, for koden, for den næste session der åbner projektet? Find vejen derhen bagefter. Aldrig "hvad er nemmest at skrive" først.

- **Bivirkninger er fejl.** Hvis en ændring producerer effekter jeg ikke har designet, er det en fejl — også når det tilfældigvis virker. Forudsigelighed er en feature, både i UI, kode og samarbejde.

- **Brugerens feedback er system-signal.** Når samme slags rettelse kommer flere gange, er det en regel der skal i DESIGN.md eller PRINCIPPER.md, ikke kun en ad-hoc fix. Værktøjer (skills, agents) foreslås kun når det konkret giver mening, aldrig spekulativt.

## Læs disse først

- **[DESIGN.md](DESIGN.md)** — visuelt sprog (typografi, palette, SVG-mønstre). *Skal opdateres til web-konteksten as we go.*
- **[PRINCIPPER.md](PRINCIPPER.md)** — pædagogiske principper. *Mest direkte gældende.*
- **[OVERSIGT.md](OVERSIGT.md)** — diciplin-oversigt og status. *Skal opdateres til web-strukturen.*
- **[REVIEW.md](REVIEW.md)** — review-rubric (Del A, B, C). *Vil få en Del D for web-specifikke kriterier.*
- **[print/](print/)** — det oprindelige print-projekt som reference (arbejdsark, tutorials, shared CSS).

## Stack

- **Next.js 15 (App Router)** med static export
- **TypeScript**
- **Tailwind CSS 3**
- **Motion** (tidligere Framer Motion) til animationer
- **Zustand** til state (progress, status pr. disciplin)
- **Lucide React** til ikoner
- **shadcn/ui** når vi har brug for færdige komponenter
- **localStorage** som datalager. Eksport/import via JSON-fil.
- **Vercel / Netlify** til static hosting

## Arkitektur

- `/` — dashboard med alle diciplinerne + status (rød/gul/grøn)
- `/<disciplin>` — disciplin-side med 3 modes: Lektion · Træning · Prøveklar
- localStorage gemmer per disciplin: `{ status, bestScore, attempts, lastAttempt }`
- Status afgøres af bedste prøveklar-score: <50% rød, 50-79% gul, ≥80% grøn
- Eleven kan retage prøveklar uendeligt — bedste tæller

## Principper i kortform

1. **Visuel kontinuitet med print**: Quicksand (display) + Inter (body) + Georgia italic (subtitles). Samme palette. Samme SVG-mønstre.
2. **Animationer er funktionelle**: hver animation har et formål. 150-300ms ease-out. Ingen bouncy distraktioner. `prefers-reduced-motion` respekteres.
3. **Interaktive illustrationer er kerne**: visualiseringer kan manipuleres (drag, slider, animér). Eleven leger med talene, ikke kun ser dem.
4. **Knappe FP9-ordlyd** overalt — også i UI ("Udregn", "Hvor meget...").
5. **Math-input**: `<input type="text" inputmode="decimal">`. Aldrig `type="number"` (slår komma ihjel på dansk). Accepter både komma og punktum.
6. **Save-fil**: eleven kan eksportere/importere progress som JSON. Forfremmer iteration uden at tabe data.
7. **Distraktorer overlever digitalt** — implicitte opgaver med distraktor-værdier i illustrationer skal stadig være der.
8. **Design desktop først, mobil hvis tiden rækker** — men byg responsivt fra start.

## Mappestruktur

```
Matematikopgaver-WEB/
├── CLAUDE.md, DESIGN.md, PRINCIPPER.md, OVERSIGT.md, REVIEW.md
├── Elevprøver_FP9guidelines/      ← FP9-PDF'er som ground truth (delt med print)
├── print/                          ← Det oprindelige print-projekt (reference)
├── .claude/                        ← Slash-kommandoer (review-ark)
├── app/                            ← Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                    ← dashboard
│   ├── globals.css
│   └── [disciplin]/                ← (kommer)
├── components/                     ← (kommer)
├── lib/
│   └── utils.ts
├── public/                         ← (kommer)
├── package.json, tsconfig.json, tailwind.config.ts, next.config.mjs
└── components.json                 ← shadcn config
```

## Kommandoer

```bash
npm run dev      # Dev server på localhost:3000
npm run build    # Build static export til ./out
npm run lint     # ESLint
```

## Hvad vi IKKE gør

- Ingen backend (endnu). Alt klient-side. Kan tilføjes via Next.js API routes eller Vercel functions hvis behov.
- Ingen auth, ingen tracking ud over localStorage.
- Ingen build-bypass af guardrails — `prefers-reduced-motion`, semantisk HTML, tastatur-navigation skal virke.

## Sproget

Alt på dansk. UI, opgavetekster, error-states. FP9-imperativ-ordlyd hvor det giver mening.

---

*Print-projektet i `print/` er ikke deprecated — det er reference. CLAUDE-instruktioner i den mappe gælder for print-relaterede beslutninger.*
