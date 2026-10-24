import { notFound } from "next/navigation";
import { FinanceDashboard, PaymentPage, InstitutionRequests, CeilingPage } from "@/components/finance-pages";
import { RequestQueue, ReviewDetail } from "@/components/review-pages";
import { Notifications, Profile } from "@/components/common-pages";
export default async function Page({ params }) {
  const { segments = [] } = await params; const [page, id] = segments;
  if (!segments.length) return <FinanceDashboard />;
  if (segments.length === 1) {
    if (page === "verifier") return <RequestQueue role="finance" />;
    if (page === "payer") return <RequestQueue role="finance" payment />;
    if (["caisse", "historique"].includes(page)) return <InstitutionRequests cash />;
    if (page === "demandes") return <InstitutionRequests />;
    if (page === "rapports") return <InstitutionRequests report />;
    if (page === "plafonds") return <CeilingPage />;
    if (page === "profil") return <Profile role="finance" />;
    if (page === "notifications") return <Notifications role="finance" />;
  }
  if (segments.length === 2) {
    if (["paiement", "recu"].includes(page)) return <PaymentPage id={id} receipt={page === "recu"} />;
    if (page === "demandes") return <ReviewDetail role="finance" id={id} />;
    if (page === "agents") return <InstitutionRequests agentId={id} />;
  }
  notFound();
}