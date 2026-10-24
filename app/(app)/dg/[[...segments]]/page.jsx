import { notFound } from "next/navigation";
import { DirectionDashboard, DirectionHistory } from "@/components/direction-pages";
import { RequestQueue, ReviewDetail } from "@/components/review-pages";
import { InstitutionRequests } from "@/components/finance-pages";
import { DelegationPage } from "@/components/workspace-pages";
import { Notifications, Profile } from "@/components/common-pages";
export default async function Page({ params }) {
  const { segments = [] } = await params;
  if (!segments.length) return <DirectionDashboard />;
  if (segments.length === 1) {
    if (segments[0] === "approuver") return <RequestQueue role="dg" />;
    if (segments[0] === "historique") return <DirectionHistory />;
    if (segments[0] === "rapports") return <InstitutionRequests role="dg" report />;
    if (segments[0] === "absence") return <DelegationPage role="dg" />;
    if (segments[0] === "profil") return <Profile role="dg" />;
    if (segments[0] === "notifications") return <Notifications role="dg" />;
  }
  if (segments[0] === "demandes" && segments.length === 2) return <ReviewDetail role="dg" id={segments[1]} />;
  notFound();
}