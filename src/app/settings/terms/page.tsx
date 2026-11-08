// 73 წესები და კონფიდენციალურობა · ანგარიში — Figma 303:2879 (back and close → 26 Settings)
import { TermsScreen } from "@/components/terms-screen";
import { requireUser } from "@/lib/session";

export default async function AccountTermsPage() {
  await requireUser();
  return <TermsScreen closeHref="/settings" />;
}
