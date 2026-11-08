// Shared layout for the many "status" screens (27, 28, 46, 55, 58–64, 70, 71):
// app bar + curves + icon panel (ResultPanel) + stacked buttons.
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AppBar, CurvesBackdrop, ResultPanel, Screen } from "./ui";

export async function StatusScreen({
  back,
  icon,
  title,
  body,
  centerTitle,
  centerBody,
  children,
}: {
  back?: string;
  icon: string;
  title: string;
  body: string;
  centerTitle?: boolean;
  centerBody?: boolean;
  /** Buttons (ButtonLink / forms) under the panel. */
  children?: ReactNode;
}) {
  const c = await getTranslations("common");
  return (
    <Screen>
      <AppBar back={back} brandLabel={c("brand")} />
      <CurvesBackdrop>
        <ResultPanel icon={icon} title={title} body={body} centerTitle={centerTitle} centerBody={centerBody} />
        {children}
      </CurvesBackdrop>
    </Screen>
  );
}
