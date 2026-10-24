export const statusLabels = {
  BROUILLON: "Brouillon", EN_ATTENTE_RESPONSABLE: "En attente du responsable", EN_ATTENTE_FINANCE: "En attente de la Finance", EN_ATTENTE_DG: "En attente du DG", APPROUVEE: "Approuvée", PAYEE: "Payée", REJETEE: "Rejetée", A_CORRIGER: "À corriger", ANNULEE: "Annulée",
};
export const transitions = {
  agent: { BROUILLON: ["EN_ATTENTE_RESPONSABLE", "ANNULEE"], A_CORRIGER: ["EN_ATTENTE_RESPONSABLE", "ANNULEE"], EN_ATTENTE_RESPONSABLE: ["ANNULEE"], EN_ATTENTE_FINANCE: ["ANNULEE"], EN_ATTENTE_DG: ["ANNULEE"] },
  responsable: { EN_ATTENTE_RESPONSABLE: ["EN_ATTENTE_FINANCE", "REJETEE", "A_CORRIGER"] },
  finance: { EN_ATTENTE_FINANCE: ["EN_ATTENTE_DG", "REJETEE", "A_CORRIGER"], APPROUVEE: ["PAYEE"] },
  dg: { EN_ATTENTE_DG: ["APPROUVEE", "REJETEE", "A_CORRIGER"] },
};
export function validateTransition(request, nextStatus, role, comment = "", payment) {
  if (!transitions[role]?.[request.status]?.includes(nextStatus)) throw new Error("Cette action n'est plus disponible pour cette demande.");
  if (["REJETEE", "A_CORRIGER"].includes(nextStatus) && !comment.trim()) throw new Error("Un commentaire est obligatoire pour rejeter, refuser ou renvoyer pour correction.");
  if (nextStatus === "PAYEE") {
    if (!payment?.confirmed) throw new Error("Confirmez la remise des espèces au bénéficiaire.");
    if (payment.mode !== "Espèces") throw new Error("Le paiement se fait uniquement en espèces.");
    if (payment.currency !== request.currency) throw new Error("La devise doit être celle de la demande.");
    if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) <= 0) throw new Error("Le montant remis doit être positif.");
    if (Number(payment.amount) !== request.amount && !payment.justification?.trim()) throw new Error("Une justification est obligatoire si le montant remis diffère du montant approuvé.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payment.date) || Number.isNaN(Date.parse(payment.date)) || payment.date > new Date().toISOString().slice(0, 10)) throw new Error("La date de remise est invalide ou dans le futur.");
    const approved = request.history?.find(event => event.status === "APPROUVEE");
    if (approved && payment.date < approved.date.slice(0, 10)) throw new Error("La remise ne peut pas précéder l'approbation du DG.");
  }
}
export function validateRequest(payload, draft = false) {
  if (!draft && (!payload.type || !payload.establishment?.trim() || !payload.reason?.trim())) throw new Error("Renseignez le type, l'établissement de santé et le motif.");
  if (!draft && (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0)) throw new Error("Le montant doit être supérieur à zéro.");
  if (!["CDF", "USD"].includes(payload.currency)) throw new Error("Choisissez CDF ou USD.");
  for (const file of payload.attachments || []) {
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Chaque pièce doit être un PDF, JPG ou PNG de 5 Mo maximum.");
  }
}
export function formatAmount(amount, currency) { return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(amount).replaceAll("\u202f", "\u00a0")}\u00a0${currency}`; }
export function formatDate(date, time = false) { return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(date)); }
export function isReminded(request, now = Date.now()) { return request.status.startsWith("EN_ATTENTE") && now - Date.parse(request.history.at(-1)?.date || request.date) > 48 * 60 * 60 * 1000; }