"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { FileText, Wallet, Bell, UserRound, ClipboardCheck, History, LayoutGrid, Banknote, ChartNoAxesColumn, UsersRound, Building2, ArrowLeftRight, Settings2, ListChecks, Menu, X, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import Brand from "@/components/brand";
import { spaces } from "@/lib/navigation";
const icons = { FileText, Wallet, Bell, UserRound, ClipboardCheck, History, LayoutGrid, Banknote, ChartNoAxesColumn, UsersRound, Building2, ArrowLeftRight, Settings2, ListChecks };
export default function Shell({ role, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const drawer = useRef(null);
  const space = spaces[role];
  function navigation() {
    return <nav aria-label="Navigation principale">{space.items.map(([path, label, icon]) => {
      const href = `/${role}${path ? `/${path}` : ""}`;
      const Icon = icons[icon];
      const active = pathname === href;
      return <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => drawer.current?.close()}><Icon size={19} strokeWidth={1.6} /><span>{label}</span></Link>;
    })}</nav>;
  }
  function identity() { return <Link className="identity" href={`/${role}/profil`} onClick={() => drawer.current?.close()}><span className="avatar">{space.initials}</span><span><strong>{space.name}</strong><small>{space.label}</small></span></Link>; }
  return <div className={`app-shell role-${role}`}>
    <aside className="sidebar"><Link href={`/${role}`} aria-label="Accueil"><Brand /></Link><div className="nav-caption">ESPACE {space.label.toLocaleUpperCase("fr")}</div>{navigation()}<div className="sidebar-footer"><div className="confidential"><ShieldCheck size={15} /> Espace confidentiel</div>{identity()}</div></aside>
    <header className="topbar"><div className="topbar-start"><button className="icon-button menu-toggle" aria-label="Ouvrir le menu" onClick={() => drawer.current.showModal()}><Menu size={22} /></button><span>CCAPAC <span className="muted">/</span> <strong>Assistance médicale</strong></span></div><div className="topbar-end">{process.env.NODE_ENV === "development" && <label className="role-switch"><span>Vue démo</span><select aria-label="Changer de rôle en développement" value={role} onChange={event => router.push(`/${event.target.value}`)}>{Object.entries(spaces).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select><ChevronDown size={14} /></label>}<Link className="icon-button notification-button" aria-label="Notifications" href={`/${role}/notifications`}><Bell size={19} /><i /></Link><Link className="avatar small" aria-label="Mon profil" href={`/${role}/profil`}>{space.initials}</Link></div></header>
    <dialog ref={drawer} className="drawer"><div className="row between"><Brand /><button className="icon-button" aria-label="Fermer le menu" onClick={() => drawer.current.close()}><X /></button></div>{navigation()}{identity()}<Link className="nav-link" href="/connexion"><LogOut size={18} />Déconnexion</Link></dialog>
    <main id="contenu" className="main-content">{children}<footer className="page-footer"><span>CCAPAC · Centre Culturel Grand Tambour</span><span>Kinshasa, RDC</span></footer></main>
    {role === "agent" && <nav className="bottom-nav" aria-label="Navigation mobile">{[["", "Demandes", FileText], ["notifications", "Alertes", Bell], ["profil", "Profil", UserRound]].map(([path, label, Icon]) => <Link key={label} href={`/agent${path ? `/${path}` : ""}`} aria-current={pathname === `/agent${path ? `/${path}` : ""}` ? "page" : undefined}><Icon size={21} strokeWidth={1.6} />{label}</Link>)}</nav>}
  </div>;
}