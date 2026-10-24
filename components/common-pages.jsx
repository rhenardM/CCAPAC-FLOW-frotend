"use client";
import { useState } from "react";
import { Bell, CheckCheck, LogOut, Save, ShieldCheck } from "lucide-react";
import { Button, EmptyState, ErrorState, Input, PageHeading, Skeleton, Tabs, useToast } from "@/components/ui";
import { useData } from "@/lib/use-data";
import { markNotificationsRead, updateProfile } from "@/lib/api";
import { formatDate } from "@/lib/api/rules";
import { roleUserIds } from "@/lib/mock/data";
import { spaces } from "@/lib/navigation";
import Link from "next/link";
export function NotificationBell({ role }) {
  const { data } = useData();
  const items = (data?.notifications || []).filter(item => item.role === role && (!item.agentId || item.agentId === roleUserIds.agent));
  return <details className="notification-dropdown"><summary className="icon-button notification-button" aria-label="Ouvrir les notifications"><Bell size={19} />{items.some(item => !item.read) && <i />}</summary><div className="notification-popover"><h2>Notifications</h2>{items.slice(0, 4).map(item => <Link key={item.id} href={item.requestId ? `/${role}/demandes/${item.requestId}` : `/${role}/notifications`} onClick={event => event.currentTarget.closest("details").removeAttribute("open")}><strong>{item.title}</strong><small>{formatDate(item.date, true)}</small></Link>)}{!items.length && <p className="secondary">Aucune notification.</p>}<Link href={`/${role}/notifications`} onClick={event => event.currentTarget.closest("details").removeAttribute("open")}>Toutes les notifications</Link></div></details>;
}
export function Profile({ role }) {
  const { data, loading, error, reload } = useData(); if (loading) return <Skeleton />; if (error) return <ErrorState error={error} retry={reload} />;
  const user = data.users.find(person => person.id === roleUserIds[role]);
  if (!user) return <EmptyState title="Profil indisponible" />;
  return <ProfileForm user={user} role={role} />;
}
function ProfileForm({ user, role }) {
  const [form, setForm] = useState(user); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const toast = useToast();
  async function submit(event) { event.preventDefault(); setBusy(true); setError(""); try { await updateProfile(role, form); toast("Votre profil a été mis à jour."); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  return <><PageHeading title="Mon profil" description="Vos informations personnelles et votre compte." /><form onSubmit={submit} className="request-form"><div className="profile-identity"><span className="avatar">{spaces[role].initials}</span><div><h2>{user.name}</h2><p className="secondary">{spaces[role].label} · {user.department}</p></div></div><Input label="Nom complet" required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /><div className="two-columns"><Input label="Matricule" value={user.id} readOnly /><Input label="Département" value={user.department} readOnly /></div><Input label="Adresse e-mail" type="email" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /><Input label="Téléphone" type="tel" placeholder="+243" value={form.phone || ""} onChange={event => setForm({ ...form, phone: event.target.value })} />{error && <p role="alert" className="field-error">{error}</p>}<div className="row wrap"><Button type="submit" loading={busy}><Save size={17} />Enregistrer</Button><Button variant="secondary" href="/mot-de-passe-oublie">Réinitialiser le mot de passe</Button></div><div className="notice"><ShieldCheck size={18} /><p>Pour modifier votre matricule, votre rôle ou votre département, contactez l’administrateur.</p></div><Button variant="danger" href="/connexion"><LogOut size={17} />Se déconnecter</Button></form></>;
}
export function Notifications({ role }) {
  const { data, loading, error, reload } = useData(); const [filter, setFilter] = useState("all"); const [busy, setBusy] = useState(false); const toast = useToast();
  async function mark(id) { setBusy(true); try { await markNotificationsRead(role, id); toast(id ? "Notification marquée comme lue." : "Toutes les notifications sont lues."); } catch (failure) { toast(failure.message, "error"); } finally { setBusy(false); } }
  if (loading) return <Skeleton />; if (error) return <ErrorState error={error} retry={reload} />;
  const notifications = data.notifications.filter(item => item.role === role && (!item.agentId || item.agentId === roleUserIds.agent));
  const shown = notifications.filter(item => filter !== "unread" || !item.read);
  return <><PageHeading title="Notifications" description="Les dernières nouvelles de votre espace." action={<Button variant="secondary" loading={busy} disabled={!notifications.some(item => !item.read)} onClick={() => mark()}><CheckCheck size={17} />Tout marquer comme lu</Button>} /><Tabs value={filter} onChange={setFilter} options={[{ value: "all", label: "Toutes" }, { value: "unread", label: "Non lues", count: notifications.filter(item => !item.read).length }]} /><div className="notifications-list">{shown.map(item => <article key={item.id} className={`notification-item ${item.read ? "" : "unread"}`}><span className="empty-icon"><Bell size={20} /></span><div className="stack"><div><h3>{item.title}</h3><p className="secondary">{item.text}</p><small className="muted">{formatDate(item.date, true)}</small></div><div className="row wrap">{item.requestId && <Button variant="secondary" href={`/${role}/demandes/${item.requestId}`}>Voir la demande</Button>}{!item.read && <Button variant="ghost" disabled={busy} onClick={() => mark(item.id)}>Marquer comme lue</Button>}</div></div></article>)}</div>{!shown.length && <EmptyState title="Vous êtes à jour" description="Aucune notification à afficher." />}</>;
}