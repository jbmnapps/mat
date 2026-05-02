---
description: Review et FP9 ark mod rubric og faktiske FP9-prøveeksempler
argument-hint: <sti til ark, fx ark/addition/arbejdsark-01.html>
---

Lav et grundigt review af arket på stien: $ARGUMENTS

## Workflow

1. **Læs rubric'et** i `REVIEW.md` for kriterierne (Del A: læringsfremmende, Del B: FP9-match)
2. **Læs principperne** i `PRINCIPPER.md` og det visuelle sprog i `DESIGN.md` for kontekst
3. **Læs arket** på stien angivet i $ARGUMENTS
4. **Spawn en subagent** (Agent tool, `subagent_type: "general-purpose"`) der:
   - Får hele rubric'et + ark-filen + de tre FP9-eksempel-PDF'er som kontekst
   - Skal vurdere systematisk Del A og Del B
   - Skal citere konkrete FP9-vendinger når ordlyd skal sammenlignes (B1)
   - Skal returnere rapport i det format der er specificeret i REVIEW.md
5. **Vis subagentens rapport** til brugeren — uændret. Ingen automatiske rettelser.
6. **Tilbyd at lave ændringerne** hvis brugeren vil have dem implementeret. Beslutningen er brugerens.

## Hvis $ARGUMENTS er tomt

Spørg brugeren hvilket ark de vil have reviewet. Vis evt. en kort liste over eksisterende ark.

## Hvis filen ikke findes

Sig det klart, og foreslå nærmeste eksisterende sti baseret på `ls ark/`.
