"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileText, Wallet, Bell, UserRound, ClipboardCheck, History, LayoutGrid, Banknote, ChartNoAxesColumn, UsersRound, Building2, ArrowLeftRight, Settings2, ListChecks, Menu, X, LogOut } from "lucide-react";
import Brand from "@/components/brand";
import { spaces } from "@/lib/navigation";
import { useData, useDemoIdentity } from "@/lib/use-data";
import { resetDemo } from "@/lib/api";
import { Button, Dialog, useToast } from "@/components/ui";
import { NotificationBell } from "@/components/common-pages";
const icons = { FileText, Wallet, Bell, UserRound, ClipboardCheck, History, LayoutGrid, Banknote, ChartNoAxesColumn, UsersRound, Building2, ArrowLeftRight, Settings2, ListChecks };
export default function Shell({ role, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const drawer = useRef(null);
  const { profile, setProfile } = useDemoIdentity();
  const { data } = useData();
  const space = spaces[profile];
  const [resetOpen, setResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  function selector() { return <label className="demo-selector"><span>Voir en tant que</span><select value={profile} onChange={event => { setProfile(event.target.value); router.push(`/${event.target.value}`); drawer.current?.close(); }}>{Object.entries(spaces).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>; }
  function navigation() {
    return <nav aria-label="Navigation principale"><Link className={`nav-link ${pathname === "/demo" ? "active" : ""}`} href="/demo" onClick={() => drawer.current?.close()}><LayoutGrid size={19} />Plan du prototype</Link>{Object.entries(spaces).map(([key, section]) => <section key={key}><h2 className="nav-caption">{section.section}</h2>{section.items.map(([path, label, icon]) => {
      const href = `/${key}${path ? `/${path}` : ""}`;
      const Icon = icons[icon];
      const active = pathname === href;
      return <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => drawer.current?.close()}><Icon size={19} strokeWidth={1.6} /><span>{label}</span></Link>;
    })}</section>)}<Link className="nav-link" href={`/${profile}/notifications`} onClick={() => drawer.current?.close()}><Bell size={19} />Notifications</Link><Link className="nav-link" href={`/${profile}/profil`} onClick={() => drawer.current?.close()}><UserRound size={19} />Mon profil</Link></nav>;
  }
  const name = data?.users.find(user => user.role.toLowerCase() === profile)?.name || space.name;
  function identity() { return <Link className="identity" href={`/${profile}/profil`} onClick={() => drawer.current?.close()}><span className="avatar">{space.initials}</span><span><strong>{name}</strong><small>{space.label}</small></span></Link>; }
  return <div className={`app-shell role-${role}`}>
    <aside className="sidebar"><Link href="/demo" aria-label="Accueil"><Brand /></Link>{selector()}{navigation()}<div className="sidebar-footer"><Button variant="ghost" onClick={() => setResetOpen(true)}>Réinitialiser la démo</Button></div></aside>
    <header className="topbar"><div className="topbar-start"><button className="icon-button menu-toggle" aria-label="Ouvrir le menu" onClick={() => drawer.current.showModal()}><Menu size={22} /></button><span>CCAPAC <span className="muted">/</span> <strong>Assistance médicale</strong></span></div><div className="topbar-end"><NotificationBell role={profile} />{identity()}</div></header>
    <dialog ref={drawer} className="drawer"><div className="row between"><Brand /><button className="icon-button" aria-label="Fermer le menu" onClick={() => drawer.current.close()}><X /></button></div>{selector()}{navigation()}<Button variant="ghost" onClick={() => setResetOpen(true)}>Réinitialiser la démo</Button><Link className="nav-link" href="/connexion"><LogOut size={18} />Déconnexion</Link></dialog>
    <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title="Réinitialiser la démo ?" footer={<><Button variant="secondary" onClick={() => setResetOpen(false)}>Conserver les données</Button><Button loading={busy} onClick={async () => { setBusy(true); try { await resetDemo(); setResetOpen(false); toast("Données de démonstration réinitialisées."); } catch (error) { toast(error.message, "error"); } finally { setBusy(false); } }}>Réinitialiser</Button></>}><p>Les modifications locales seront remplacées par les 40 demandes et 25 utilisateurs de référence.</p></Dialog>
    <main id="contenu" className="main-content">{children}<footer className="page-footer"><span>CCAPAC · Centre Culturel Grand Tambour</span><span>Kinshasa, RDC</span></footer></main>
    {role === "agent" && <nav className="bottom-nav" aria-label="Navigation mobile">{[["", "Demandes", FileText], ["notifications", "Alertes", Bell], ["profil", "Profil", UserRound]].map(([path, label, Icon]) => <Link key={label} href={`/agent${path ? `/${path}` : ""}`} aria-current={pathname === `/agent${path ? `/${path}` : ""}` ? "page" : undefined}><Icon size={21} strokeWidth={1.6} />{label}</Link>)}</nav>}
  </div>;
}