"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronRight, FileText, Plus, Search, ShieldCheck, Wallet, X } from "lucide-react";
import { Button, Card, CurrencyAmount, Dialog, EmptyState, ErrorState, Input, PageHeading, Pagination, Skeleton, StatusBadge, Tabs, Textarea, useToast } from "@/components/ui";
import { useData } from "@/lib/use-data";
import { saveRequest } from "@/lib/api";
import { formatDate, validateRequest } from "@/lib/api/rules";
import { roleUserIds } from "@/lib/mock/data";
import RequestDetail from "@/components/request-detail";
function ownRequests(data) { return data.requests.filter(request => request.agentId === roleUserIds.agent); }
const inProgress = request => request.status.startsWith("EN_ATTENTE") || request.status === "APPROUVEE";
export function AgentHome() {
  const { data, loading, error, reload } = useData(); const [filter, setFilter] = useState("all"); const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  if (loading) return <Skeleton />; if (error) return <ErrorState error={error} retry={reload} />;
  const requests = ownRequests(data); const paid = requests.filter(request => request.status === "PAYEE");
  const shown = requests.filter(request => (filter === "all" || (filter === "pending" && inProgress(request)) || (filter === "draft" && request.status === "BROUILLON") || (filter === "correction" && request.status === "A_CORRIGER")) && `${request.id} ${request.type}`.toLowerCase().includes(search.toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(shown.length / pageSize)));
  const pageRequests = shown.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <>
    <PageHeading eyebrow="VENDREDI 23 OCTOBRE 2026" title={`Bonjour, ${data.users.find(user => user.id === roleUserIds.agent)?.name.split(" ")[0] || "Mireille"}`} description="Retrouvez vos demandes et suivez leur prise en charge." action={<Button className="new-request-desktop" href="/agent/nouvelle"><Plus size={18} />Nouvelle demande</Button>} />
    <div className="agent-stats"><div className="stat-cell"><div className="row between"><span>Demandes en cours</span><FileText size={18} /></div><strong>{requests.filter(inProgress).length.toString().padStart(2, "0")}</strong><small>En cours de traitement</small></div><div className="stat-cell"><div className="row between"><span>Demandes payées</span><ShieldCheck size={18} /></div><strong>{paid.length.toString().padStart(2, "0")}</strong><small>Depuis janvier 2026</small></div><div className="stat-cell"><div className="row between"><span>Montant reçu cette année</span><Wallet size={18} /></div><CurrencyAmount amount={paid.filter(request => request.currency === "CDF").reduce((sum, request) => sum + request.amount, 0)} currency="CDF" /><small>+ {paid.filter(request => request.currency === "USD").reduce((sum, request) => sum + request.amount, 0)} USD</small></div><Link className="balance-link" href="/agent/solde"><CalendarDays size={20} /><strong>Mon solde annuel</strong><span>Voir mes droits <ArrowUpRight size={15} /></span></Link></div>
    <Button className="new-request-mobile" href="/agent/nouvelle"><Plus size={19} />Nouvelle demande</Button>
    <section className="request-list-section">
      <div className="section-heading"><div className="row"><h2>Mes demandes</h2><span className="count">{requests.length}</span></div><div className="search-field"><Search size={16} /><input aria-label="Rechercher une demande" placeholder="Rechercher une demande" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></div></div>
      <div className="filter-row"><Tabs value={filter} onChange={value => { setFilter(value); setPage(1); }} options={[{ value: "all", label: "Toutes" }, { value: "pending", label: "En cours", count: requests.filter(inProgress).length }, { value: "correction", label: "À corriger", count: requests.filter(request => request.status === "A_CORRIGER").length }, { value: "draft", label: "Brouillons" }]} /><span className="muted text-small">Année 2026</span></div>
      <div className="request-list">{pageRequests.map(request => <Link className="request-item" key={request.id} href={`/agent/demandes/${request.id}`}><div className="request-icon"><FileText size={21} /></div><div className="request-item-main"><div className="request-item-top"><span className="request-number">{request.id}</span><StatusBadge status={request.status} /></div><div className="request-item-body"><h3>{request.type}</h3><CurrencyAmount amount={request.amount} currency={request.currency} /></div><p>{request.establishment} <span>· {formatDate(request.date)}</span></p></div><ChevronRight size={17} className="muted request-chevron" /></Link>)}</div>
      {!shown.length && <EmptyState title={requests.length ? "Aucune demande trouvée" : "Votre première demande"} description={requests.length ? "Essayez un autre filtre ou numéro de demande." : "Vous n’avez pas encore de demande d’assistance médicale."} action={!requests.length && <Button href="/agent/nouvelle"><Plus size={16} />Nouvelle demande</Button>} />}
      <Pagination page={currentPage} pageSize={pageSize} total={shown.length} onChange={setPage} />
    </section>
    <div className="help-strip"><ShieldCheck size={18} /><p>Vos informations médicales restent confidentielles.</p><span>CCAPAC · Assistance aux agents</span></div>
  </>;
}
export function AgentDetail({ id }) {
  const { data, loading, error, reload } = useData();
  if (loading) return <Skeleton />; if (error) return <ErrorState error={error} retry={reload} />;
  const request = ownRequests(data).find(item => item.id === id);
  if (!request) return <EmptyState title="Demande introuvable" action={<Button href="/agent">Mes demandes</Button>} />;
  return <><PageHeading title={request.id} description="Détail et suivi de votre demande" back="/agent" /><RequestDetail request={request} /></>;
}
export function AgentFormPage({ id }) {
  const { data, loading, error, reload } = useData();
  if (loading) return <Skeleton />; if (error) return <ErrorState error={error} retry={reload} />;
  const request = id && ownRequests(data).find(item => item.id === id);
  if (id && (!request || !["BROUILLON", "A_CORRIGER"].includes(request.status))) return <EmptyState title="Cette demande n’est pas modifiable" action={<Button href="/agent">Mes demandes</Button>} />;
  return <RequestForm key={id || "new"} request={request} types={data.settings.types} />;
}
function RequestForm({ request, types }) {
  const router = useRouter(); const toast = useToast(); const [form, setForm] = useState({ type: request?.type || types[0], establishment: request?.establishment || "", amount: request?.amount || "", currency: request?.currency || "CDF", reason: request?.reason || "", attachments: request?.attachments || [] });
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false); const [confirm, setConfirm] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  async function upload(event) {
    setUploading(true); setError("");
    try {
      const files = Array.from(event.target.files); validateRequest({ ...form, attachments: files }, true);
      const records = await Promise.all(files.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result }); reader.onerror = () => reject(new Error("La pièce jointe n’a pas pu être lue.")); reader.readAsDataURL(file); })));
      update("attachments", [...form.attachments, ...records]);
    } catch (failure) { setError(failure.message); } finally { setUploading(false); event.target.value = ""; }
  }
  async function save(draft) {
    setBusy(true); setError("");
    try { const result = await saveRequest(form, { draft, id: request?.id }); toast(draft ? "Brouillon enregistré." : "Demande transmise à votre responsable."); router.push(`/agent/demandes/${result.id}`); }
    catch (failure) { setError(failure.message); setConfirm(false); } finally { setBusy(false); }
  }
  function submit(event) { event.preventDefault(); try { validateRequest(form); setError(""); setConfirm(true); } catch (failure) { setError(failure.message); } }
  return <><PageHeading title={request?.status === "A_CORRIGER" ? "Corriger la demande" : request ? "Modifier le brouillon" : "Nouvelle demande"} description="Renseignez les informations nécessaires à votre prise en charge." back="/agent" /><form className="request-form" onSubmit={submit}>{request?.status === "A_CORRIGER" && <div className="notice notice-danger"><strong>Commentaire de correction</strong><p>{request.history.findLast(event => event.status === "A_CORRIGER")?.comment}</p></div>}<fieldset><legend>Type d’assistance</legend><Tabs label="Type d’assistance" value={form.type} onChange={value => update("type", value)} options={types.map(type => ({ value: type, label: type }))} /></fieldset><Input label="Établissement de santé" placeholder="Ex. Clinique Ngaliema" required value={form.establishment} onChange={event => update("establishment", event.target.value)} /><div className="amount-input-row"><Input label="Montant estimé" type="number" min="0.01" step="0.01" required placeholder="0" value={form.amount} onChange={event => update("amount", event.target.value)} /><fieldset><legend>Devise</legend><Tabs label="Devise de la demande" value={form.currency} onChange={value => update("currency", value)} options={[{ label: "CDF", value: "CDF" }, { label: "USD", value: "USD" }]} /></fieldset></div><Textarea label="Motif" placeholder="Précisez la nature des soins et le motif de votre demande." required value={form.reason} onChange={event => update("reason", event.target.value)} /><Input label="Pièces jointes · facultatif" type="file" accept="application/pdf,image/jpeg,image/png" multiple onChange={upload} disabled={uploading} hint="Ordonnance ou facture · PDF, JPG, PNG · 5 Mo maximum par pièce" />{form.attachments.map((file, index) => <div className="attachment" key={`${file.name}-${index}`}><FileText size={18} /><span>{file.name}</span><button type="button" className="icon-button" aria-label={`Retirer ${file.name}`} onClick={() => update("attachments", form.attachments.filter((_, fileIndex) => fileIndex !== index))}><X size={16} /></button></div>)}{error && <p className="field-error" role="alert">{error}</p>}<div className="notice"><ShieldCheck size={17} /><p>Les pièces jointes sont facultatives. Votre demande sera examinée par votre responsable, la Finance et le Directeur général.</p></div><div className="action-bar"><Button variant="secondary" onClick={() => save(true)} loading={busy} disabled={uploading}>Brouillon</Button><Button type="submit" disabled={busy || uploading}>Soumettre la demande</Button></div></form><Dialog open={confirm} onClose={() => !busy && setConfirm(false)} title="Soumettre la demande ?" footer={<><Button variant="secondary" onClick={() => setConfirm(false)} disabled={busy}>Revenir</Button><Button onClick={() => save(false)} loading={busy}>Confirmer l’envoi</Button></>}><p>Votre demande de <CurrencyAmount amount={Number(form.amount)} currency={form.currency} /> sera transmise à votre responsable.</p></Dialog></>;
}
export function AgentBalance() {
  const { data, loading, error, reload } = useData(); if (loading) return <Skeleton />; if (error) return <ErrorState error={error} retry={reload} />;
  const requests = ownRequests(data).filter(request => new Date(request.date).getFullYear() === 2026);
  return <><PageHeading title="Mon solde annuel" description="Vos prises en charge et vos droits pour l’année 2026." back="/agent" /><div className="two-columns">{["CDF", "USD"].map(currency => { const ceiling = Number(data.settings[`ceiling${currency}`]); const used = requests.filter(request => request.status === "PAYEE" && request.currency === currency).reduce((sum, request) => sum + request.amount, 0); const pending = requests.filter(request => inProgress(request) && request.currency === currency).reduce((sum, request) => sum + request.amount, 0); return <Card key={currency} className="balance-card"><span className="eyebrow">SOLDE DISPONIBLE EN {currency}</span><CurrencyAmount amount={Math.max(0, ceiling - used)} currency={currency} className="amount-large" /><progress max={ceiling} value={Math.min(used, ceiling)} aria-label={`Plafond utilisé en ${currency}`} /><dl className="receipt-lines"><div><dt>Plafond annuel</dt><dd><CurrencyAmount amount={ceiling} currency={currency} /></dd></div><div><dt>Déjà perçu</dt><dd><CurrencyAmount amount={used} currency={currency} /></dd></div><div><dt>En cours d’examen</dt><dd><CurrencyAmount amount={pending} currency={currency} /></dd></div></dl></Card>; })}</div><div className="notice"><ShieldCheck size={18} /><p>Les montants en CDF et en USD sont comptabilisés séparément. Les demandes en cours ne sont pas encore déduites du solde.</p></div><h2 className="section-title">Prises en charge de l’année</h2><div className="request-list">{requests.filter(request => request.status === "PAYEE").map(request => <Link className="request-item" key={request.id} href={`/agent/demandes/${request.id}`}><span><strong>{request.type}</strong><small className="block muted">{formatDate(request.date)}</small></span><CurrencyAmount amount={request.amount} currency={request.currency} /></Link>)}</div></>;
}