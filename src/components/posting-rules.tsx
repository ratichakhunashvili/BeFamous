// "გამოქვეყნების პირობები" notice card (13, 41): required hashtags for the challenge.
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function PostingRules({ hashtags }: { hashtags: string | null }) {
  const t = await getTranslations("post");
  const tags = (hashtags ?? "").split(/\s+/).filter(Boolean);
  const list = tags.length > 1 ? `${tags.slice(0, -1).join(", ")} ${t("and")} ${tags.at(-1)}` : tags[0] ?? "";
  return (
    <div className="flex w-full flex-col gap-2 rounded-bf-16 bg-elevated p-4 text-white">
      <span className="flex items-center gap-2">
        <Image src="/figma/icon-lock.svg" alt="" width={18} height={18} className="size-[18px]" />
        <span className="text-label">{t("rulesTitle")}</span>
      </span>
      <p className="text-body">{t("rulesBody", { tags: list })}</p>
    </div>
  );
}
