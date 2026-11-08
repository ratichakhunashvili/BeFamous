// Admin 38 შესწორების მოთხოვნა — Figma 22:833
import { DecisionPage } from "../decision-page";

export default async function RevisionPage({ params }: PageProps<"/admin/participants/[id]/revision">) {
  const { id } = await params;
  return <DecisionPage id={id} decision="revision" />;
}
