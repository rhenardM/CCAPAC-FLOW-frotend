import { notFound } from "next/navigation";
import { AgentBalance, AgentDetail, AgentFormPage } from "@/components/agent-pages";
import { Notifications, Profile } from "@/components/common-pages";
export default async function Page({ params }) {
  const { segments = [] } = await params;
  if (segments.length === 1) {
    if (segments[0] === "nouvelle") return <AgentFormPage />;
    if (segments[0] === "solde") return <AgentBalance />;
    if (segments[0] === "profil") return <Profile role="agent" />;
    if (segments[0] === "notifications") return <Notifications role="agent" />;
  }
  if (segments[0] === "demandes" && segments.length === 2) return <AgentDetail id={segments[1]} />;
  if (segments[0] === "demandes" && segments.length === 3 && segments[2] === "modifier") return <AgentFormPage id={segments[1]} />;
  notFound();
}