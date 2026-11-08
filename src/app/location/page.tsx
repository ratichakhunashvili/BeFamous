// 53 მდებარეობა — Figma 300:1837. Picks the city used to filter challenges (saved on the profile).
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { setCityAction } from "@/app/actions/profile";
import { AppBar, Button, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import { cities, isCity } from "@/lib/cities";
import { listChallenges } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { CityRow } from "./city-row";

export default async function LocationPage() {
  const session = await requireUser();
  const t = await getTranslations("location");
  const tc = await getTranslations("cities");
  const c = await getTranslations("common");
  const [user, all] = await Promise.all([db.query.users.findFirst({ where: eq(schema.users.id, session.id), columns: { city: true } }), listChallenges()]);
  const current = isCity(user?.city) ? user.city : "tbilisi";
  const counts = new Map<string, number>();
  for (const r of all) if (r.challenge.city) counts.set(r.challenge.city, (counts.get(r.challenge.city) ?? 0) + 1);

  return (
    <Screen>
      <AppBar back="/discover/filters" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
        <form action={setCityAction} className="flex w-full flex-col gap-5">
          {cities.map((city) => (
            <CityRow
              key={city}
              city={city}
              name={tc(city)}
              selected={city === current}
              caption={city === current ? t("selected") : counts.get(city) ? t("active", { count: counts.get(city)! }) : t("none")}
            />
          ))}
          <Button type="submit" name="city" value={current}>
            {t("save")}
          </Button>
        </form>
      </CurvesBackdrop>
    </Screen>
  );
}
