// "BEFAMOUS REWARDS / REWARDS CLUB" gift card art (22 card: 326×194, 23 hero: 350×192).
import { getTranslations } from "next-intl/server";
import { CollectionHero } from "./collection-hero";

export async function RewardArt({ wide = false }: { wide?: boolean }) {
  const t = await getTranslations("rewardsPage");
  return (
    <CollectionHero
      art={{ icon: "gift", kicker: t("kicker"), label: t("club") }}
      height={wide ? 192 : 194}
      ellipse={wide ? { left: 199.85, top: -30.72, w: 227.5, h: 218.88 } : { left: 186.15, top: -31.04, w: 211.9, h: 221.16 }}
    />
  );
}
