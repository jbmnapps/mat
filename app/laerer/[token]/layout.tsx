/**
 * Layout for /laerer/[token]/.
 *
 * generateStaticParams returnerer KUN det rigtige token fra env-var. Det
 * betyder at static export kun bygger den ene gyldige sti — alle andre
 * /laerer/<noget>/-URL'er vil 404 fra GitHub Pages.
 *
 * Det er ikke "rigtig" sikkerhed (token findes også i bundle hvis man
 * graver), men det forhindrer casual visitors og søgemaskiner i at finde
 * URL'en.
 */

export async function generateStaticParams() {
  const token = process.env.NEXT_PUBLIC_LAERER_TOKEN;
  if (!token) return [];
  return [{ token }];
}

export default function LaererLayout({ children }: { children: React.ReactNode }) {
  return children;
}
