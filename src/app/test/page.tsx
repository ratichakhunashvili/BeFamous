// ⚠️ TEMPORARY test panel for test@test.com (local test mode only). Not a Figma screen.
import Link from "next/link";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { testCheckinAction, testDecideAction, testPostStateAction, testResetAction } from "@/app/actions/test-tools";
import { SubmitButton } from "@/components/submit-button";
import { AppBar, CurvesBackdrop, PageTitle, Panel, Screen } from "@/components/ui";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/session";
import { isTestAccount } from "@/lib/test-mode";

const messages: Record<string, string> = {
  reset: "პროგრესი წაიშალა — შეგიძლია თავიდან დაიწყო.",
  nopending: "შესამოწმებელი პოსტი არ გაქვს. ჯერ დაარეგისტრირე პოსტი მისიაში.",
  nopost: "ჯერ პოსტი არ გაქვს დარეგისტრირებული.",
  join: "ჯერ შეუერთდი გამოწვევას, რომელსაც პოსტის მისია აქვს.",
};

export default async function TestPanel({ searchParams }: PageProps<"/test">) {
  const user = await requireUser();
  if (!isTestAccount(user.email)) notFound();
  const sp = await searchParams;
  const joined = await db.select({ id: schema.participations.challengeId }).from(schema.participations).where(eq(schema.participations.userId, user.id));
  const visitMissions = joined.length
    ? await db
        .select({ id: schema.missions.id, title: schema.missions.titleKa, challenge: schema.challenges.titleKa })
        .from(schema.missions)
        .innerJoin(schema.challenges, eq(schema.challenges.id, schema.missions.challengeId))
        .where(and(eq(schema.missions.type, "visit_qr"), inArray(schema.missions.challengeId, joined.map((j) => j.id))))
    : [];
  const btn = "!h-10 !text-caption";
  return (
    <Screen>
      <AppBar back="/home" brandLabel="BEFAMOUS" />
      <CurvesBackdrop>
        <PageTitle eyebrow="ტესტი · დროებითი" title="ტესტის პანელი" body="მხოლოდ test@test.com-ისთვის, ლოკალურად. აქედან შეგიძლია გამოტოვო ნაბიჯები, რომლებიც სხვაგვარად ადმინს ან კამერას სჭირდება." />
        {typeof sp.msg === "string" && messages[sp.msg] && <p className="w-full rounded-bf-12 bg-elevated p-3 text-caption text-white">{messages[sp.msg]}</p>}

        <Panel className="flex w-full flex-col gap-3 p-4 text-white">
          <h2 className="text-h3">QR ვიზიტი კამერის გარეშე</h2>
          {visitMissions.length === 0 ? (
            <p className="text-caption text-muted">
              ჯერ შეუერთდი ვიზიტის გამოწვევას (მაგ. <Link className="text-primary underline" href="/challenges/secret-coffee-moment">Secret Coffee Moment</Link>).
            </p>
          ) : (
            visitMissions.map((m) => (
              <form key={m.id} action={testCheckinAction}>
                <input type="hidden" name="missionId" value={m.id} />
                <SubmitButton className={btn}>{`დაადასტურე QR · ${m.challenge}`}</SubmitButton>
              </form>
            ))
          )}
        </Panel>

        <Panel className="flex w-full flex-col gap-3 p-4 text-white">
          <h2 className="text-h3">ჩემი ბოლო პოსტის შეფასება (ადმინის ნაცვლად)</h2>
          {(["approved", "revision", "rejected"] as const).map((d) => (
            <form key={d} action={testDecideAction}>
              <input type="hidden" name="decision" value={d} />
              <SubmitButton variant={d === "approved" ? "primary" : "secondary"} className={btn}>
                {{ approved: "დამტკიცება (+XP, ჯილდო)", revision: "შესწორების მოთხოვნა", rejected: "უარყოფა" }[d]}
              </SubmitButton>
            </form>
          ))}
        </Panel>

        <Panel className="flex w-full flex-col gap-3 p-4 text-white">
          <h2 className="text-h3">პოსტის მდგომარეობები (59–64)</h2>
          {(
            [
              ["found", "ნაპოვნი პოსტი (59)"],
              ["unavailable", "პოსტი მიუწვდომელია (62)"],
              ["metrics_unavailable", "მეტრიკები მიუწვდომელია (63)"],
              ["refresh_failed", "განახლება შეფერხდა (64)"],
              ["expired", "TikTok კავშირის ვადა (61)"],
            ] as const
          ).map(([state, label]) => (
            <form key={state} action={testPostStateAction}>
              <input type="hidden" name="state" value={state} />
              <SubmitButton variant="quiet" className={btn}>
                {label}
              </SubmitButton>
            </form>
          ))}
        </Panel>

        <form action={testResetAction} className="w-full">
          <SubmitButton variant="secondary">ყველაფრის თავიდან დაწყება</SubmitButton>
        </form>
      </CurvesBackdrop>
    </Screen>
  );
}
