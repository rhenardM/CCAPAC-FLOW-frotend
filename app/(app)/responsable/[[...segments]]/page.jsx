import { notFound } from "next/navigation";
import { RequestQueue, ReviewDetail } from "@/components/review-pages";
import { Notifications, Profile } from "@/components/common-pages";
import { ResponsibleDashboard, TeamPage, DelegationPage } from "@/components/workspace-pages";
export default async function Page({ params }) {
  const { segments = [] } = await params;
  if (!segments.length) return <ResponsibleDashboard />;
  if (segments.length === 1) {
    if (segments[0] === "valider") return <RequestQueue role="responsable" />;
    if (segments[0] === "equipe") return <TeamPage />;
    if (segments[0] === "absence") return <DelegationPage />;
    if (segments[0] === "historique") return <RequestQueue role="responsable" history />;
    if (segments[0] === "profil") return <Profile role="responsable" />;
    if (segments[0] === "notifications") return <Notifications role="responsable" />;
  }
  if (segments[0] === "demandes" && segments.length === 2) return <ReviewDetail role="responsable" id={segments[1]} />;
  notFound();
}