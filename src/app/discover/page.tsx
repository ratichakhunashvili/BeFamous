// 07 აღმოჩენა (Discover) — Figma 87:6630; with a category selected it becomes 33 (87:9207).
// Filters come from the URL: ?category=cafes&q=ყავა&city=tbilisi
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChallengeCard, type CardChallenge } from "@/components/challenge-card";
import { BottomNav, TabTopBar } from "@/components/nav";
import { ButtonLink, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import type { Locale } from "@/i18n/request";
import { isCity } from "@/lib/cities";
import { tr } from "@/lib/i18n-fields";
import { getInterests, listChallenges } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function DiscoverPage({ searchParams }: PageProps<"/discover">) {
  await requireUser();
  const sp = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("discover");
  const tc = await getTranslations("citiesIn");

  const interests = await getInterests();
  const category = interests.find((i) => i.slug === sp.category);
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const city = isCity(sp.city) ? sp.city : undefined;
  const filtered = Boolean(category || q || city);

  const rows = await listChallenges({ interestSlugs: category ? [category.slug] : undefined, q: q || undefined, city });
  const cards = rows.map((r, index): CardChallenge & { half: boolean } => {
    // Layout as drawn in 07: full, half + half, full … Full cards show the brand, half cards the category chip.
    const half = !filtered && (index % 4 === 1 || index % 4 === 2);
    const interest = interests.find((i) => i.slug === r.interestSlug);
    const label = half && interest ? tr(interest, "chip", locale) : r.challenge.brand;
    return {
      slug: r.challenge.slug,
      title: tr(r.challenge, "title", locale),
      meta: `${label}  ·  +${r.challenge.xpReward} XP`,
      coverUrl: r.challenge.coverUrl,
      coverArt: r.challenge.coverArt,
      half,
    };
  });

  const title = category ? tr(category, "resultsTitle", locale) : q ? t("searchTitle") : t("title");
  const body = filtered ? (city ? t("results", { count: rows.length, city: tc(city) }) : t("resultsAll", { count: rows.length })) : t("body");
  const keep = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: q || undefined, city, ...extra })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/discover?${s}` : "/discover";
  };

  // Chips: "all", the first interest (as in Figma: "კაფეები"), the active one if different, and "filter".
  const chipInterests = [interests[0], category].filter((i, n, a) => i && a.findIndex((x) => x?.id === i.id) === n) as typeof interests;

  return (
    <Screen>
      <TabTopBar />
      <CurvesBackdrop clearance={100}>
        <PageTitle eyebrow={t("eyebrow")} title={title} body={body} />

        <div className="flex w-full flex-col gap-2">
          <span className="text-label text-white">{t("search")}</span>
          <Link href="/discover/filters" className="relative block h-12 w-full rounded-bf-12 border border-line bg-surface">
            <span className={`absolute left-[15px] top-3 text-body text-white`}>{q || (category ? tr(category, "chip", locale) : t("placeholder"))}</span>
            <Image src="/figma/icon-search-18.svg" alt="" width={18} height={18} className="absolute right-[15px] top-[14px] size-[18px]" />
          </Link>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2">
          <Chip href={keep({})} active={!category} label={t("all")} width={80} />
          {chipInterests.map((i) => (
            <Chip key={i.id} href={keep({ category: i.slug })} active={category?.id === i.id} label={tr(i, "chip", locale)} width={108} />
          ))}
          <Chip href="/discover/filters" active={false} label={t("filter")} width={98} />
        </div>

        {cards.length === 0 && <p className="w-full rounded-bf-16 border border-line bg-surface p-4 text-center text-body text-white">{t("empty")}</p>}

        <CardGrid cards={cards} />

        {filtered && (
          <ButtonLink href="/discover" variant="secondary">
            {t("clear")}
          </ButtonLink>
        )}
      </CurvesBackdrop>
      <BottomNav active="discover" />
    </Screen>
  );
}

function Chip({ href, active, label, width }: { href: string; active: boolean; label: string; width: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-11 items-center justify-center rounded-full px-3 text-caption text-white ${active ? "bg-action" : "bg-elevated hover:bg-elevated/70"}`}
      style={{ minWidth: width }}
    >
      {label}
    </Link>
  );
}

/** Pairs consecutive half cards into one row. */
function CardGrid({ cards }: { cards: (CardChallenge & { half: boolean })[] }) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c.half && cards[i + 1]?.half) {
      out.push(
        <div key={c.slug} className="flex w-full gap-3">
          <ChallengeCard c={c} size="half" />
          <ChallengeCard c={cards[i + 1]} size="half" />
        </div>,
      );
      i++;
    } else {
      out.push(<ChallengeCard key={c.slug} c={c} mediaHeight={i === 0 || !cards[i - 1]?.half ? 168 : 150} />);
    }
  }
  return <>{out}</>;
}
