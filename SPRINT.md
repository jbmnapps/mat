# Sprint-koordination — parallelle sessions

> To Claude-sessions arbejder samtidigt på `weekend`-grunden i hver sin worktree.
> Læs ved start. Opdater status ved start og slut, ikke konstant.

**Tidshorisont:** Lørdag aften 2026-05-02, ~1 time aktiv parallel-arbejde.

## Aktive sessions

| Session | Branch | Worktree | Hovedopgave |
|---------|--------|----------|-------------|
| **Share** | `weekend-share` | `~/WORKSPACES/Matematikopgaver-WEB-share/` | Polish af share-siden, eksport/import-bulletproofing, evt. TTS-fundament |
| **Supabase** | `weekend-supabase` | `~/WORKSPACES/Matematikopgaver-WEB-supabase/` | Login + sync + lærer-side på hovedversionen (`/mat`) |

## File ownership

### Share-session må røre:
- `lib/opgaver/*.ts` (opgavejusteringer)
- `components/illustrations/*` (nye eller eksisterende)
- `components/quiz.tsx` — **kun TTS-knap-tilføjelse**, ikke sync-logik
- Public assets (`public/*`)
- /share/-deploy: manuel push til gh-pages efter build

### Supabase-session må røre:
- Nye filer: `lib/supabase-client.ts`, `lib/auth.ts`, `app/login/`, `app/laerer/`
- `lib/store.ts` — **må tilføje sync-lag**, ikke ændre eksisterende API uden koordinering
- `components/quiz.tsx` — **kun sync-hook ved svar**, ikke andet
- `package.json` — må tilføje `@supabase/supabase-js`
- `.github/workflows/deploy.yml` — må tilføje env-vars
- `next.config.mjs` — må tilføje env-exposure

### Konflikt-zone (`components/quiz.tsx`)
Begge sessions vil røre denne fil. **Aftale:** Share-session laver TTS-knap-tilføjelsen FØRST og merger til weekend. Supabase-session puller weekend ind, og laver derefter sync-hook ovenpå.

### Forbudt for begge før koordinering:
- Ændringer i `lib/store.ts`'s eksisterende API
- Ændringer i `app/layout.tsx`
- Ændringer i CLAUDE.md, PROEVE-PREP.md eller dette dokument uden eksplicit bekræftelse

## Workflow pr. session

1. **Start:** `git pull origin weekend && git merge weekend` for at tage seneste integration ind
2. **Arbejd:** kun i de filer du ejer (se ovenfor)
3. **Commit + push:** til din egen branch (`weekend-share` eller `weekend-supabase`)
4. **Færdig:** brugeren merger din branch til `weekend`. Aldrig force-push.

## Mergeplan

1. Share-session færdig først (~30-40 min) → merge til `weekend` → deploy til `/mat/` automatisk + manuel push til `/share/` når relevant
2. Supabase-session merger `weekend` ind i sin branch (henter share-ændringer)
3. Supabase-session færdiggør → merge til `weekend` → deploy til `/mat/` automatisk

Hvis konflikter: bruger og sessioner aftaler i chat hvordan de løses.

## Status-log

> Format: `[YYYY-MM-DD HH:MM] [Session] besked`

- *(første session, skriv her ved start)*

## Brugerens ansvar

- Holde øje med begge chats og brokere ved konflikter
- Sende Supabase URL + anon key + en lang tilfældig lærer-token til Supabase-sessionen
- Mergebeslutninger
- Sige til hvis en session skal røre noget i "forbudt"-zonen

## Briefing til ny Supabase-session (kopier ind når du åbner den)

```
Du arbejder i Matematikopgaver-WEB-supabase/ på weekend-supabase-branch som del
af et parallelt sprint. Læs i denne rækkefølge:

1. CLAUDE.md (auto-loaded)
2. PROEVE-PREP.md
3. SPRINT.md
4. BACKEND-TJEK.md

Din opgave: implementér Supabase-backend til hovedversionen (/mat) — login med
navn + 4-cifret kode, sync af progress, lærer-side på /laerer/<token>. Du må
KUN røre filer der står under "Supabase-session må røre" i SPRINT.md.

Mine credentials:
- NEXT_PUBLIC_SUPABASE_URL: <indsæt>
- NEXT_PUBLIC_SUPABASE_ANON_KEY: <indsæt>
- NEXT_PUBLIC_LAERER_TOKEN: <generer 32 tilfældige tegn, eller bed mig om det>

Begynd med at læse de fire dokumenter ovenfor.
```
