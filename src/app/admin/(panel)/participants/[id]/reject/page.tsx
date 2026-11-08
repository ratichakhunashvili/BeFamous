// Admin 39 უარყოფის დადასტურება — Figma 22:834
import { DecisionPage } from "../decision-page";

export default async function RejectPage({ params }: PageProps<"/admin/participants/[id]/reject">) {
  const { id } = await params;
  return <DecisionPage id={id} decision="rejected" />;
}
