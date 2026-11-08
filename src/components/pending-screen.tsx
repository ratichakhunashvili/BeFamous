// Temporary stand-in for screens scheduled in later phases, so Phase 1 links don't 404.
// Each one is replaced by its real Figma screen in its phase.
import { getTranslations } from "next-intl/server";
import { signoutAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import { AppBar, Button, CurvesBackdrop, PageTitle, Screen } from "@/components/ui";

export async function PendingScreen({ screen }: { screen: string }) {
  const t = await getTranslations("pending");
  const c = await getTranslations("common");
  const session = await auth();
  return (
    <Screen>
      <AppBar back="history" brandLabel={c("brand")} />
      <CurvesBackdrop>
        <PageTitle eyebrow={screen} title={t("title")} body={t("body")} />
        {session?.user && (
          <>
            <p className="w-full text-center text-caption text-muted">
              {session.user.name} · {session.user.email} · {session.user.role}
            </p>
            <form action={signoutAction} className="w-full">
              <Button variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </>
        )}
      </CurvesBackdrop>
    </Screen>
  );
}
