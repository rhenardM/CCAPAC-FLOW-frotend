import { initialData, roleUserIds } from "../mock/data.js";
import { validateRequest, validateTransition, statusLabels } from "./rules.js";
const KEY = "ccapac-demo-v1";
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
function audit(data, role, action, target) { data.audit.unshift({ id: crypto.randomUUID(), date: new Date().toISOString(), actor: data.users.find(user => user.id === roleUserIds[role])?.name || "Système", action, target }); }
export async function getData() { await delay(); const data = read(); if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("etat") === "vide") return { ...data, requests: [], users: [], notifications: [], audit: [], departments: [], delegations: [] }; return structuredClone(data); }
export async function listRequests({ role = "agent", status, search = "", currency, department } = {}) {
  const data = await getData();
  return data.requests.filter(request => (role !== "agent" || request.agentId === roleUserIds.agent) && (role !== "responsable" || request.department === "Communication") && (!status || request.status === status) && (!currency || request.currency === currency) && (!department || request.department === department) && `${request.id} ${request.agent} ${request.establishment}`.toLowerCase().includes(search.toLowerCase()));
}
export async function saveRequest(payload, { draft = false, id } = {}) {
  await delay(); validateRequest(payload, draft); const data = read();
  const current = id ? data.requests.find(request => request.id === id) : null;
  if (id && (!current || !["BROUILLON", "A_CORRIGER"].includes(current.status) || current.agentId !== roleUserIds.agent)) throw new Error("Cette demande n'est pas modifiable.");
  const user = data.users.find(person => person.id === roleUserIds.agent);
  const year = new Date().getFullYear();
  const sequence = Math.max(0, ...data.requests.filter(request => request.id.startsWith(`BAM-${year}-`)).map(request => Number(request.id.split("-")[2]))) + 1;
  const record = { ...current, type: payload.type, establishment: payload.establishment, reason: payload.reason, amount: Number(payload.amount) || 0, currency: payload.currency, attachments: payload.attachments || [], id: current?.id || `BAM-${year}-${String(sequence).padStart(5, "0")}`, agentId: user.id, agent: user.name, department: user.department, status: draft ? (current?.status === "A_CORRIGER" ? "A_CORRIGER" : "BROUILLON") : "EN_ATTENTE_RESPONSABLE", date: current?.date || new Date().toISOString(), history: [...(current?.history || [])] };
  if (!draft) record.history.push({ status: record.status, label: current?.status === "A_CORRIGER" ? "Demande corrigée et soumise" : "Demande soumise", actor: user.name, date: new Date().toISOString() });
  data.requests = current ? data.requests.map(request => request.id === id ? record : request) : [record, ...data.requests];
  audit(data, "agent", draft ? "Enregistrement du brouillon" : "Soumission de la demande", record.id); write(data); return record;
}
export async function transitionRequest(id, { status, role, comment = "", payment } = {}) {
  await delay(); const data = read(); const request = data.requests.find(item => item.id === id);
  if (!request) throw new Error("Demande introuvable.");
  if (role === "agent" && request.agentId !== roleUserIds.agent) throw new Error("Cette demande ne vous appartient pas.");
  if (role === "responsable" && request.department !== "Communication") throw new Error("Cette demande ne relève pas de votre équipe.");
  validateTransition(request, status, role, comment, payment);
  request.status = status;
  const actor = data.users.find(user => user.id === roleUserIds[role])?.name;
  request.history.push({ status, label: statusLabels[status], actor, comment: comment.trim(), date: new Date().toISOString() });
  if (payment) request.payment = { ...payment, amount: Number(payment.amount), recordedBy: actor };
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
  if (collection === "departments" && existing && existing.name !== record.name) { data.users.forEach(user => { if (user.department === existing.name) user.department = record.name; }); }
  audit(data, "admin", existing ? "Modification" : "Création", record.id); write(data); return record;
}
export async function importUsers(rows) {
  await delay(); const data = read(); const ids = new Set(data.users.map(user => user.id)); const emails = new Set(data.users.map(user => user.email.toLowerCase()));
  const records = rows.map((row, index) => {
    const record = { id: String(row.matricule || "").trim(), name: String(row.nom || "").trim(), email: String(row.email || "").trim(), department: String(row.departement || "").trim(), role: String(row.role || "AGENT").toUpperCase(), active: true, lastLogin: null };
    if (!/^AG-\d{4,}$/.test(record.id) || !record.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email) || !["AGENT", "RESPONSABLE", "FINANCE", "DG", "ADMIN"].includes(record.role) || !data.departments.some(item => item.name === record.department)) throw new Error(`Ligne ${index + 2} : matricule, nom, e-mail, département ou rôle invalide.`);
    if (ids.has(record.id) || emails.has(record.email.toLowerCase())) throw new Error(`Ligne ${index + 2} : matricule ou e-mail déjà utilisé.`);
    ids.add(record.id); emails.add(record.email.toLowerCase()); return record;
  });
  if (!records.length) throw new Error("Le fichier ne contient aucun utilisateur.");
  data.users.push(...records); audit(data, "admin", `Import de ${records.length} utilisateurs`, "Utilisateurs"); write(data); return records.length;
}
export async function saveSettings(settings) {
  await delay(); if (!Number.isInteger(Number(settings.reminderDays)) || settings.reminderDays < 1 || Number(settings.ceilingCDF) <= 0 || Number(settings.ceilingUSD) <= 0 || !settings.types.length || settings.types.some(type => !type.trim())) throw new Error("Les délais et plafonds doivent être positifs. Au moins un type est requis.");
  const data = read(); data.settings = { ...settings, types: [...new Set(settings.types.map(type => type.trim()))] }; audit(data, "admin", "Modification des paramètres", "Configuration"); write(data);
}
export async function authenticate({ identifier, password }) {
  await delay(); const user = read().users.find(person => person.id.toLowerCase() === identifier.toLowerCase().trim() || person.email.toLowerCase() === identifier.toLowerCase().trim());
  if (!user || !user.active || password !== "GrandTambour2026!") throw new Error("Identifiant ou mot de passe incorrect, ou compte désactivé.");
  return { user, role: user.role.toLowerCase() };
}
export async function requestPasswordReset(email) { await delay(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Saisissez une adresse e-mail valide."); return { simulated: true }; }