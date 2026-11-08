// 45 პროფილის რედაქტირება — Figma 87:10103. Name, location (city list, so discover filters keep working), bio.
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import { cities } from "@/lib/cities";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export default async function EditProfilePage() {
  const session = await requireUser();
  const t = await getTranslations("profilePage");
  const c = await getTranslations("common");
  const tc = await getTranslations("cities");
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, session.id) });
  if (!user) return null;

  return (
    <Screen>
      <AppBar back="/profile" brandLabel={c("brand")} />
      <CurvesBackdrop clearance={96}>
        <PageTitle eyebrow={t("editEyebrow")} title={t("editTitle")} body={t("editBody")} align="bodyStart" />
        <ProfileForm
          initial={{ name: user.name, city: user.city ?? "", bio: user.bio ?? "" }}
          cities={cities.map((v) => ({ value: v, label: tc(v) }))}
          labels={{
            name: t("name"),
            location: t("location"),
            noCity: t("noCity"),
            bio: t("bio"),
            save: t("save"),
            errors: { name: t("errName"), bio: t("errBio"), city: t("errCity") },
          }}
        />
      </CurvesBackdrop>
    </Screen>
  );
}
