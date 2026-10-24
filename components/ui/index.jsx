"use client";
import Link from "next/link";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, FileText, LoaderCircle, X } from "lucide-react";
import { formatAmount, formatDate, statusLabels } from "@/lib/api/rules";
export function Button({ children, variant = "primary", className = "", href, loading, ...props }) {
  const classes = `button button-${variant} ${className}`;
  if (href) return <Link href={href} className={classes} {...props}>{children}</Link>;
  return <button type="button" className={classes} {...props} disabled={props.disabled || loading}>{loading && <LoaderCircle size={17} className="spin" />}{children}</button>;
}
function Field({ as: Element, label, error, hint, id, className = "", children, ...props }) {
  const generated = useId(); const fieldId = id || generated;
  return <div className={`field ${className}`}><label htmlFor={fieldId}>{label}{props.required && <span aria-hidden="true"> *</span>}</label><Element id={fieldId} aria-invalid={!!error} aria-describedby={error || hint ? `${fieldId}-help` : undefined} {...props}>{children}</Element>{(error || hint) && <small id={`${fieldId}-help`} className={error ? "field-error" : "muted"} role={error ? "alert" : undefined}>{error || hint}</small>}</div>;
}
export function Input(props) { return <Field as="input" {...props} />; }
export function Textarea(props) { return <Field as="textarea" rows={4} {...props} />; }
export function Select(props) { return <Field as="select" {...props} />; }
export function Card({ children, className = "", ...props }) { return <div className={`card ${className}`} {...props}>{children}</div>; }
export function CurrencyAmount({ amount, currency, className = "" }) { return <span className={`currency ${className}`}>{formatAmount(amount, currency)}</span>; }
export function StatusBadge({ status }) {
  const tone = ["APPROUVEE", "PAYEE"].includes(status) ? "success" : ["REJETEE", "A_CORRIGER"].includes(status) ? "danger" : status?.startsWith("EN_ATTENTE") ? "pending" : "neutral";
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{statusLabels[status] || status}</span>;
}
export function EmptyState({ title = "Aucun résultat", description = "Aucune demande ne correspond à votre recherche.", action }) { return <div className="empty-state"><span className="empty-icon"><FileText size={27} /></span><h2>{title}</h2><p>{description}</p>{action}</div>; }
export function Skeleton({ rows = 4 }) { return <div className="stack" role="status" aria-label="Chargement en cours"><span className="sr-only">Chargement en cours</span>{Array.from({ length: rows }, (_, index) => <div className="skeleton" key={index} />)}</div>; }
export function Pagination({ page, pageSize, total, onChange }) {
  if (!total) return null;
  const pageCount = Math.ceil(total / pageSize);
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return <nav className="pagination" aria-label="Pagination des demandes">
    <p className="pagination-summary" role="status">{first} à {last} sur {total} demande{total > 1 ? "s" : ""}</p>
    <div className="pagination-controls">
      <Button variant="secondary" className="pagination-button" aria-label="Page précédente" title="Page précédente" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={18} /></Button>
      <span className="pagination-current">Page {page} sur {pageCount}</span>
      <Button variant="secondary" className="pagination-button" aria-label="Page suivante" title="Page suivante" disabled={page >= pageCount} onClick={() => onChange(page + 1)}><ChevronRight size={18} /></Button>
    </div>
  </nav>;
}
export function ErrorState({ error, retry }) { return <div className="error-state" role="alert"><AlertCircle size={25} /><h2>Chargement interrompu</h2><p>{error?.message || "Une erreur est survenue."}</p><Button variant="secondary" onClick={retry}>Réessayer</Button></div>; }
export function Table({ columns, rows, rowKey = "id", selectedId, onSelect, empty }) { return <div className="table-frame" tabIndex={0} role="region" aria-label="Tableau défilant"><table><thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[rowKey]} className={selectedId === row[rowKey] ? "selected" : ""}>{columns.map((column, index) => <td key={column.key}>{onSelect && index === 0 ? <button className="table-select" onClick={() => onSelect(row)} aria-label={`Ouvrir ${row[rowKey]}`} aria-pressed={selectedId === row[rowKey]}>{column.render ? column.render(row) : row[column.key]}</button> : column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody></table>{!rows.length && (empty || <EmptyState />)}</div>; }
export function PageHeading({ title, description, eyebrow, action, back }) { return <header className="page-heading"><div>{back && <Link className="back-link" href={back}><ArrowLeft size={16} /> Retour</Link>}{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>; }
export function Tabs({ options, value, onChange, label = "Filtrer" }) { return <div className="tabs" role="group" aria-label={label}>{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} className={value === option.value ? "active" : ""} onClick={() => onChange(option.value)}>{option.label}{option.count !== undefined && <span>{option.count}</span>}</button>)}</div>; }
export function Dialog({ open, onClose, title, children, footer }) {
  const ref = useRef(null); const titleId = useId();
  useEffect(() => { if (open && !ref.current.open) ref.current.showModal(); else if (!open && ref.current.open) ref.current.close(); }, [open]);
  return <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={onClose} onClose={onClose}><div className="row between modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={19} /></button></div><div className="modal-body">{children}</div>{footer && <div className="modal-footer">{footer}</div>}</dialog>;
}
const ToastContext = createContext(null);
export function Toast({ message, onClose }) { return <div className={`toast ${message.type === "error" ? "toast-error" : ""}`} role={message.type === "error" ? "alert" : "status"}>{message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}<span>{message.text}</span><button aria-label="Fermer la notification" className="icon-button" onClick={onClose}><X size={17} /></button></div>; }
export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(null), 6000); return () => clearTimeout(timer); }, [message]);
  return <ToastContext.Provider value={(text, type = "success") => setMessage({ text, type })}>{children}{message && <Toast message={message} onClose={() => setMessage(null)} />}</ToastContext.Provider>;
}
export function useToast() { return useContext(ToastContext); }
export function Stepper({ request }) {
  const steps = [["EN_ATTENTE_RESPONSABLE", "Demande soumise"], ["EN_ATTENTE_FINANCE", "Validation du responsable"], ["EN_ATTENTE_DG", "Vérification de la Finance"], ["APPROUVEE", "Approbation du DG"], ["PAYEE", "Retrait en espèces à la Finance"]];
  const completed = steps.findIndex(([status]) => status === request.status);
  return <ol className="stepper">{steps.map(([status, label], index) => {
    const event = request.history.findLast(item => item.status === status);
    const done = !!event; const current = index === completed + 1 && !["REJETEE", "A_CORRIGER", "ANNULEE", "BROUILLON", "PAYEE"].includes(request.status);
    return <li key={status} className={done ? "done" : current ? "current" : ""} aria-current={current ? "step" : undefined}><span className="step-marker">{done ? <Check size={14} /> : current ? <span /> : null}</span><div><strong>{label}</strong><small>{event ? `${event.actor} · ${formatDate(event.date, true)}` : current ? "En cours" : "À venir"}</small></div></li>;
  })}</ol>;
}