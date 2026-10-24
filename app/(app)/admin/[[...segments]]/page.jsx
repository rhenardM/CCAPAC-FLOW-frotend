import { notFound } from "next/navigation";
import { AdminDashboard, UsersPage, UserPage, DepartmentsPage, DelegationsAdmin, SettingsPage, AuditPage, ImportPage } from "@/components/admin-pages";
import { InstitutionRequests } from "@/components/finance-pages";
import { ReviewDetail } from "@/components/review-pages";
import { Notifications, Profile } from "@/components/common-pages";
export default async function Page({ params }) {
  const { segments = [] } = await params; const [page, id, action] = segments;
  if (!segments.length) return <AdminDashboard />;
  if (segments.length === 1) {
    if (page === "utilisateurs") return <UsersPage />;
    if (page === "import") return <ImportPage />;
    if (page === "departements") return <DepartmentsPage />;
    if (page === "suppleances") return <DelegationsAdmin />;
    if (page === "parametres") return <SettingsPage />;
    if (page === "audit") return <AuditPage />;
    if (page === "demandes") return <InstitutionRequests role="admin" />;
    if (page === "profil") return <Profile role="admin" />;
    if (page === "notifications") return <Notifications role="admin" />;
  }
  if (segments.length === 2) {
    if (page === "utilisateurs") return <UserPage id={id === "nouveau" ? undefined : id} />;
    if (page === "departements" && id === "nouveau") return <DepartmentsPage edit />;
    if (page === "audit") return <AuditPage id={id} />;
    if (page === "demandes") return <ReviewDetail role="admin" id={id} />;
  }
  if (segments.length === 3 && action === "modifier") {
    if (page === "utilisateurs") return <UserPage id={id} edit />;
    if (page === "departements") return <DepartmentsPage id={id} edit />;
  }
  notFound();
}