import { initialData, roleUserIds } from "../mock/data.js";
import { validateRequest, validateTransition, statusLabels } from "./rules.js";
import { inspectUsers } from "./import-rules.js";
const KEY = "ccapac-demo-v2";
let serverData = structuredClone(initialData);
function read() {
  if (typeof window === "undefined") return serverData;
  try { const stored = localStorage.getItem(KEY); return stored ? JSON.parse(stored) : structuredClone(initialData); }
  catch { throw new Error("Les données locales sont indisponibles. Autorisez le stockage dans votre navigateur."); }
}
function write(data) {
  if (typeof window === "undefined") serverData = data;
  else { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { throw new Error("Stockage local saturé. Retirez une pièce jointe volumineuse et réessayez."); } window.dispatchEvent(new Event("ccapac:change")); }
}
async function delay() {
  await new Promise(resolve => setTimeout(resolve, 180));
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("etat") === "erreur") throw new Error("Les données n'ont pas pu être chargées. Veuillez réessayer.");
}
function audit(data, role, action, target) {
  const date = new Date().toISOString();
  data.audit.unshift({ id: crypto.randomUUID(), date, actor: data.users.find(user => user.id === roleUserIds[role])?.name || "Système", action, target });
  data.notifications.unshift({ id: crypto.randomUUID(), role, title: action, text: target, date, read: false, ...(target.startsWith("BAM-") ? { requestId: target } : {}) });
}
export async function resetDemo() { await delay(); const data = structuredClone(initialData); audit(data, "admin", "Réinitialisation de la démo", "Institution"); write(data); }
export async function getData() { await delay(); const data = read(); if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("etat") === "vide") return { ...data, requests: [], users: [], notifications: [], audit: [], departments: [], delegations: [] }; return structuredClone(data); }
export async function listRequests({ role = "agent", status, search = "", currency, department } = {}) {
  const data = await getData();
  return data.requests.filter(request => (role !== "agent" || request.agentId === roleUserIds.agent) && (role !== "responsable" || request.department === "Communication") && (!status || request.status === status) && (!currency || request.currency === currency) && (!department || request.department === department) && `${request.id} ${request.agent} ${request.establishment}`.toLowerCase().includes(search.toLowerCase()));
}
export async function saveRequest(payload, { draft = false, id } = {}) {
  await delay(); validateRequest(payload, draft); const data = read();
  const current = id ? data.requests.find(request => request.id === id) : null;
  if (id && (!current || !["BROUILLON", "A_CORRIGER"].includes(current.status))) throw new Error("Cette demande n'est pas modifiable.");
  const user = data.users.find(person => person.id === (current?.agentId || roleUserIds.agent));
  const year = new Date().getFullYear();
  const sequence = Math.max(0, ...data.requests.filter(request => request.id.startsWith(`BAM-${year}-`)).map(request => Number(request.id.split("-")[2]))) + 1;
  const record = { ...current, type: payload.type, establishment: payload.establishment, reason: payload.reason, amount: Number(payload.amount) || 0, currency: payload.currency, attachments: payload.attachments || [], id: current?.id || `BAM-${year}-${String(sequence).padStart(5, "0")}`, agentId: user.id, agent: user.name, department: user.department, status: draft ? (current?.status === "A_CORRIGER" ? "A_CORRIGER" : "BROUILLON") : "EN_ATTENTE_RESPONSABLE", date: current?.date || new Date().toISOString(), history: [...(current?.history || [])] };
  if (!draft) {
    record.history.push({ status: record.status, label: current?.status === "A_CORRIGER" ? "Demande corrigée et soumise" : "Demande soumise", actor: user.name, date: new Date().toISOString() });
    data.notifications.unshift({ id: crypto.randomUUID(), role: "responsable", title: "Nouvelle demande à valider", text: record.id, requestId: record.id, date: new Date().toISOString(), read: false });
  }
  data.requests = current ? data.requests.map(request => request.id === id ? record : request) : [record, ...data.requests];
  audit(data, "agent", draft ? "Enregistrement du brouillon" : "Soumission de la demande", record.id); write(data); return record;
}
export async function transitionRequest(id, { status, role, comment = "", payment } = {}) {
  await delay(); const data = read(); const request = data.requests.find(item => item.id === id);
  if (!request) throw new Error("Demande introuvable.");
  validateTransition(request, status, role, comment, payment);
  request.status = status;
  const actor = data.users.find(user => user.id === roleUserIds[role])?.name;
  request.history.push({ status, label: statusLabels[status], actor, comment: comment.trim(), date: new Date().toISOString() });
  if (payment) request.payment = { ...payment, amount: Number(payment.amount), recordedBy: actor };
  const nextRole = { EN_ATTENTE_FINANCE: "finance", EN_ATTENTE_DG: "dg", APPROUVEE: "finance" }[status];
  if (nextRole) data.notifications.unshift({ id: crypto.randomUUID(), role: nextRole, title: "Une demande attend votre intervention", text: id, requestId: id, date: new Date().toISOString(), read: false });
  data.notifications.unshift({ id: crypto.randomUUID(), role: "agent", agentId: request.agentId, title: `${request.id} : ${statusLabels[status]}`, text: comment || (status === "APPROUVEE" ? "Présentez-vous au guichet de la Finance pour le retrait en espèces." : "Le suivi de votre demande a été mis à jour."), date: new Date().toISOString(), read: false, requestId: id });
  audit(data, role, statusLabels[status], id); write(data); return request;
}
export async function updateProfile(role, payload) {
  await delay(); const data = read(); const user = data.users.find(person => person.id === roleUserIds[role]);
  if (!payload.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error("Indiquez un nom et une adresse e-mail valide.");
  Object.assign(user, { name: payload.name, email: payload.email, phone: payload.phone || "" }); audit(data, role, "Mise à jour du profil", user.id); write(data); return user;
}
export async function markNotificationsRead(role, id) { await delay(); const data = read(); data.notifications.forEach(item => { if (item.role === role && (!id || item.id === id) && (!item.agentId || item.agentId === roleUserIds.agent)) item.read = true; }); write(data); }
export async function saveAdminEntity(collection, payload) {
  await delay(); const data = read();
  if (!["users", "departments", "delegations"].includes(collection)) throw new Error("Collection invalide.");
  if (collection === "users") {
    if (!payload.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || !/^AG-\d{4,}$/.test(payload.id) || !["AGENT", "RESPONSABLE", "FINANCE", "DG", "ADMIN"].includes(payload.role) || !data.departments.some(item => item.name === payload.department)) throw new Error("Vérifiez le nom, l'e-mail, le matricule AG-0000, le rôle et le département.");
    if (data.users.some(user => user.id !== payload.id && user.email.toLowerCase() === payload.email.toLowerCase())) throw new Error("Cette adresse e-mail est déjà utilisée.");
  }
  if (collection === "departments" && (!payload.name?.trim() || data.departments.some(item => item.id !== payload.id && item.name.toLowerCase() === payload.name.trim().toLowerCase()))) throw new Error("Le nom du département est obligatoire et doit être unique.");
  if (collection === "delegations" && (!payload.owner || !payload.substitute || payload.owner === payload.substitute || !payload.start || !payload.end || payload.end < payload.start)) throw new Error("Choisissez deux personnes distinctes et une période valide.");
  const record = { ...payload, id: payload.id || crypto.randomUUID() };
  const existing = data[collection].find(item => item.id === record.id);
  data[collection] = existing ? data[collection].map(item => item.id === record.id ? record : item) : [...data[collection], record];
  if (collection === "departments" && existing && existing.name !== record.name) { data.users.forEach(user => { if (user.department === existing.name) user.department = record.name; }); data.requests.forEach(request => { if (request.department === existing.name) request.department = record.name; }); }
  audit(data, "admin", existing ? "Modification" : "Création", record.id); write(data); return record;
}
export async function importUsers(rows) {
  await delay(); const data = read(); const inspected = inspectUsers(rows, data);
  const invalid = inspected.find(item => item.errors.length);
  if (invalid) throw new Error(`Ligne ${invalid.id} : ${invalid.errors.join(", ")}.`);
  const records = inspected.map(item => item.record);
  if (!records.length) throw new Error("Le fichier ne contient aucun utilisateur.");
  data.users.push(...records); audit(data, "admin", `Import de ${records.length} utilisateurs`, "Utilisateurs"); write(data); return records.length;
}
export async function saveSettings(settings) {
  await delay(); if (!Number.isInteger(Number(settings.reminderDays)) || settings.reminderDays < 1 || Number(settings.ceilingCDF) <= 0 || Number(settings.ceilingUSD) <= 0 || !settings.types.length || settings.types.some(type => !type.trim())) throw new Error("Les délais et plafonds doivent être positifs. Au moins un type est requis.");
  const data = read(); data.settings = { ...settings, types: [...new Set(settings.types.map(type => type.trim()))] }; audit(data, "admin", "Modification des paramètres", "Configuration"); write(data);
}
export async function authenticate({ identifier, password }) {
  await delay(); const data = read(); const user = data.users.find(person => person.id.toLowerCase() === identifier.toLowerCase().trim() || person.email.toLowerCase() === identifier.toLowerCase().trim());
  if (!user || !user.active || password !== "GrandTambour2026!") throw new Error("Identifiant ou mot de passe incorrect, ou compte désactivé.");
  user.lastLogin = new Date().toISOString(); audit(data, user.role.toLowerCase(), "Connexion", user.id); write(data);
  return { user, role: user.role.toLowerCase() };
}
export async function requestPasswordReset(email) { await delay(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Saisissez une adresse e-mail valide."); const data = read(); audit(data, "admin", "Demande de réinitialisation du mot de passe", email); write(data); return { simulated: true }; }
export async function changePassword({ password, confirmation }) { await delay(); if (password.length < 12 || password !== confirmation) throw new Error("Utilisez au moins 12 caractères et une confirmation identique."); const data = read(); audit(data, "agent", "Changement du mot de passe simulé", "Compte de démonstration"); write(data); return { simulated: true }; }
export async function requestAccountAccess({ name, identifier, email, department } = {}) {
  await delay();
  const payload = { name: String(name || "").trim(), identifier: String(identifier || "").trim().toUpperCase(), email: String(email || "").trim().toLowerCase(), department: String(department || "").trim() };
  if (!payload.name || payload.name.length > 120 || !/^AG-\d{4,}$/.test(payload.identifier) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254 || !payload.department || payload.department.length > 120) throw new Error("Vérifiez le nom, le matricule AG-0000, l’e-mail et le département.");
  const data = read();
  const pending = data.accessRequests || [];
  if (data.users.some(user => user.id === payload.identifier || user.email.toLowerCase() === payload.email) || pending.some(request => request.identifier === payload.identifier || request.email === payload.email)) throw new Error("Un compte ou une demande existe déjà avec ce matricule ou cet e-mail. Connectez-vous ou contactez l’administration.");
  const record = { ...payload, id: crypto.randomUUID(), status: "EN_ATTENTE", role: "AGENT", date: new Date().toISOString() };
  data.accessRequests = [...pending, record];
  audit(data, "admin", "Demande de création de compte", record.identifier);
  write(data);
  return { simulated: true, request: record };
}