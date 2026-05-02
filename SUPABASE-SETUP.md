# Supabase-setup — tjekliste til Jonas

> Det her er trinene du skal igennem ÉN GANG før login virker. Tag dem i rækkefølge. Estimat: 15 minutter inkl. test.
>
> Når du er færdig, så gå til [BACKEND-TJEK.md](BACKEND-TJEK.md) og besvar de 6 spørgsmål før du deler linket med eleverne.

---

## 1. Kør SQL-scriptet (5 min)

1. Åbn Supabase-dashboardet for projektet `jkfxirpqhdettipixunl`.
2. Klik **SQL Editor** i venstre menu → **New query**.
3. Åbn `supabase-schema.sql` i denne mappe og **kopiér hele filen**.
4. Indsæt i SQL Editor → klik **Run**.
5. Du burde se "Success. No rows returned" og 2 nye tabeller (`students`, `progress`) under **Table Editor**.

### Verifikation: er RLS aktiveret?

Kør denne SQL-snippet i samme editor for at bekræfte:

```sql
select tablename, rowsecurity from pg_tables
  where schemaname = 'public' and tablename in ('students', 'progress');
```

Begge tabeller SKAL vise `rowsecurity = true`. Hvis ikke → STOP og kontakt mig (Claude).

```sql
select policyname, tablename from pg_policies where schemaname = 'public';
```

Skal vise 6 policies (3 pr. tabel). Hvis færre → STOP.

---

## 2. Slå email-bekræftelse fra (1 min)

Vores syntetiske emails (fx `sara@elev.fp9.local`) er ikke rigtige adresser, så Supabase skal ikke prøve at sende bekræftelses-mail.

1. Supabase → **Authentication** → **Sign In / Up** → fanen **Email**.
2. Slå **Confirm email** FRA.
3. Gem.

---

## 3. Tilføj credentials som GitHub Secrets (3 min)

Det er det her der gør at deploy'en kan bygge med dine Supabase-keys uden at lægge dem i koden.

1. Gå til https://github.com/jbmnapps/mat/settings/secrets/actions
2. Klik **New repository secret** og opret tre stykker:

   | Navn | Værdi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://jkfxirpqhdettipixunl.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_1bRQfIyTBOlz9Y0E6bRRng_4vw_Cdlq` |
   | `NEXT_PUBLIC_LAERER_TOKEN` | `a178cc26269c2c5d8ca1d49bad1e9aca` |

3. Gem hver enkelt.

> **Sikkerhed:** Publishable-keyen er designet til at være public, men lærer-tokenen er den eneste ting der adskiller dig fra eleverne. Hvis tokenen lækker, generer en ny (32 hex-tegn) og opdater både her og i .env.local + redeploy.

---

## 4. Test lokalt (3 min)

```bash
npm run dev
```

1. Åbn http://localhost:3000/login
2. Skriv navn `TestElev` + kode `0000` → klik **Log ind**.
3. Du burde se "Konto oprettet · Hej, TestElev".
4. I Supabase → **Table Editor** → `students`: der burde nu være én række med `name_slug = testelev`.
5. Lav en træning (fx Addition), gennemfør hele quizzen.
6. I Supabase → `progress`: én række med `discipline_id = addition`, `best_score` matcher hvad du fik i %.

### Test lærer-siden

Åbn http://localhost:3000/laerer/a178cc26269c2c5d8ca1d49bad1e9aca/

Du burde se "1 elev" og kunne klappe TestElev op for at se status pr. disciplin.

### Test forkert link

Åbn http://localhost:3000/laerer/wrong-token/ → skal give "Forkert link".

---

## 5. Tjek Supabase-logs (2 min) — VIGTIGT

Efter setup:

1. Supabase → **Logs** → **API logs**.
2. Kig efter:
   - 401-fejl (auth-problem)
   - 403-fejl (RLS afviser noget den ikke burde)
   - 500-fejl (server-fejl)
3. Hvis du ser noget mistænkeligt: send et screenshot til mig (Claude).

---

## 6. Deploy (1 min)

Bemærk: **Supabase-session merger ikke selv til weekend-branch**. Når du har testet og godkendt:

```bash
git checkout weekend
git merge weekend-supabase
git push origin weekend
```

GitHub Actions bygger automatisk og deployer til https://jbmnapps.github.io/mat/ ~2 min senere.

---

## 7. Før du sender link til eleverne

Gå til [BACKEND-TJEK.md](BACKEND-TJEK.md) og forlang `JA` til alle 6 spørgsmål nederst. Hvis du er i tvivl, så spørg mig.

### Foreslået besked til eleverne

> Træn til mandagens FP9 her: https://jbmnapps.github.io/mat/login/
>
> 1. Vælg et navn (fornavn er fint, eller find på et).
> 2. Vælg en 4-cifret kode du selv kan huske. Skriv den ned så du kan logge ind igen i morgen.
> 3. Kom i gang. Status gemmer sig automatisk.
>
> Hvis du glemmer din kode, sig til på mandag.

---

## Efter prøven (mandag/tirsdag)

- Eksportér evt. SQL-dump fra Supabase som arkiv.
- Slet alle elev-rækker hvis ønsket: `delete from auth.users where email like '%@elev.fp9.local';` (cascader til students + progress).
- Roter eller slet lærer-tokenen.
- Cherry-pick relevant kode til main, men IKKE denne fil eller PROEVE-PREP.md.
