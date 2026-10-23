export const assistanceTypes = ["Consultation", "Médicaments", "Hospitalisation", "Examens", "Autre"];
export const users = [
  { id: "AG-0012", name: "Patrick Ilunga", email: "p.ilunga@centreculturel.cd", department: "Communication", role: "RESPONSABLE", active: true, lastLogin: "2026-10-23T08:42:00" },
  { id: "AG-0123", name: "Mireille Kabongo", email: "m.kabongo@centreculturel.cd", department: "Communication", role: "AGENT", active: true, lastLogin: "2026-10-22T17:10:00" },
  { id: "AG-0031", name: "Grâce Mbuyi", email: "g.mbuyi@centreculturel.cd", department: "Finance", role: "FINANCE", active: true, lastLogin: "2026-10-23T09:05:00" },
  { id: "AG-0187", name: "Jonathan Lukusa", email: "j.lukusa@centreculturel.cd", department: "Communication", role: "AGENT", active: true, lastLogin: "2026-10-20T11:30:00" },
  { id: "AG-0098", name: "Albert Nzuzi", email: "a.nzuzi@centreculturel.cd", department: "Technique", role: "AGENT", active: false, lastLogin: "2026-08-12T10:00:00" },
  { id: "AG-0154", name: "Sarah Kalala", email: "s.kalala@centreculturel.cd", department: "Programmation", role: "AGENT", active: true, lastLogin: "2026-10-23T08:00:00" },
  { id: "AG-0086", name: "Didier Mwamba", email: "d.mwamba@centreculturel.cd", department: "Technique", role: "AGENT", active: true, lastLogin: "2026-10-21T13:12:00" },
  { id: "AG-0062", name: "Nadège Tshibangu", email: "n.tshibangu@centreculturel.cd", department: "Bibliothèque", role: "AGENT", active: true, lastLogin: "2026-10-22T15:30:00" },
  { id: "AG-0001", name: "Direction générale", email: "direction@centreculturel.cd", department: "Administration", role: "DG", active: true, lastLogin: "2026-10-23T07:55:00" },
  { id: "AG-0002", name: "Rhenard Munongo", email: "r.munongo@centreculturel.cd", department: "Administration", role: "ADMIN", active: true, lastLogin: "2026-10-23T08:15:00" },
];
export const roleUserIds = { agent: "AG-0123", responsable: "AG-0012", finance: "AG-0031", dg: "AG-0001", admin: "AG-0002" };
function request(number, agentId, type, amount, currency, status, day, extra = {}) {
  const user = users.find(person => person.id === agentId);
  const date = `2026-10-${String(day).padStart(2, "0")}T09:14:00`;
  const history = status === "BROUILLON" ? [] : [{ status: "EN_ATTENTE_RESPONSABLE", label: "Demande soumise", actor: user.name, date }];
  if (["EN_ATTENTE_FINANCE", "EN_ATTENTE_DG", "APPROUVEE", "PAYEE"].includes(status)) history.push({ status: "EN_ATTENTE_FINANCE", label: "Validée par le responsable", actor: "Patrick Ilunga", date });
  if (["EN_ATTENTE_DG", "APPROUVEE", "PAYEE"].includes(status)) history.push({ status: "EN_ATTENTE_DG", label: "Vérifiée par la Finance", actor: "Grâce Mbuyi", date, comment: "Montant conforme aux justificatifs." });
  if (["APPROUVEE", "PAYEE"].includes(status)) history.push({ status: "APPROUVEE", label: "Approuvée par le DG", actor: "Direction générale", date });
  if (status === "PAYEE") history.push({ status: "PAYEE", label: "Paiement en espèces enregistré", actor: "Grâce Mbuyi", date });
  if (status === "A_CORRIGER") history.push({ status, label: "Renvoyée pour correction", actor: "Grâce Mbuyi", date, comment: "Merci de préciser le détail des examens et de vérifier le montant indiqué." });
  return { id: `BAM-2026-${String(number).padStart(5, "0")}`, agentId, agent: user.name, department: user.department, type, amount, currency, status, date, establishment: "Clinique Ngaliema", reason: "Consultation et prise en charge médicale sur prescription. Assistance sollicitée pour les frais de soins.", attachments: [], history, ...(status === "PAYEE" ? { payment: { amount, currency, mode: "Espèces", date: date.slice(0, 10), reference: `PC-2026-${number}`, confirmed: true } } : {}), ...extra };
}
export const requests = [
  request(42, "AG-0123", "Consultation", 150000, "CDF", "EN_ATTENTE_DG", 21),
  request(31, "AG-0123", "Médicaments", 80, "USD", "PAYEE", 9),
  request(27, "AG-0123", "Examens", 45000, "CDF", "A_CORRIGER", 2),
  request(46, "AG-0123", "Consultation", 65000, "CDF", "BROUILLON", 23),
  request(21, "AG-0123", "Consultation", 125000, "CDF", "PAYEE", 1),
  request(44, "AG-0187", "Médicaments", 60, "USD", "EN_ATTENTE_RESPONSABLE", 23, { establishment: "Pharmacie du Boulevard", reason: "Achat des médicaments prescrits après consultation pour infection respiratoire." }),
  request(45, "AG-0123", "Examens", 85000, "CDF", "EN_ATTENTE_RESPONSABLE", 22),
  request(39, "AG-0154", "Examens", 95000, "CDF", "EN_ATTENTE_FINANCE", 22),
  request(37, "AG-0086", "Hospitalisation", 420, "USD", "EN_ATTENTE_FINANCE", 20),
  request(36, "AG-0062", "Consultation", 75000, "CDF", "EN_ATTENTE_FINANCE", 20),
  request(40, "AG-0187", "Médicaments", 60, "USD", "EN_ATTENTE_FINANCE", 22),
  request(41, "AG-0123", "Consultation", 50000, "CDF", "EN_ATTENTE_FINANCE", 22),
  request(35, "AG-0154", "Examens", 90000, "CDF", "APPROUVEE", 19),
  request(34, "AG-0086", "Consultation", 120, "USD", "APPROUVEE", 18),
  request(33, "AG-0062", "Médicaments", 65000, "CDF", "APPROUVEE", 18),
  request(38, "AG-0154", "Consultation", 100000, "CDF", "EN_ATTENTE_DG", 21),
  request(30, "AG-0086", "Examens", 150, "USD", "REJETEE", 8, { history: [{ status: "REJETEE", label: "Demande rejetée", actor: "Patrick Ilunga", date: "2026-10-08T14:00:00", comment: "Demande déjà prise en charge dans le dossier BAM-2026-00025." }] }),
];
export const departments = ["Communication", "Logistique", "Programmation", "Technique", "Bibliothèque", "Administration", "Finance"].map((name, index) => ({ id: `DEP-${index + 1}`, name, manager: index === 0 ? "Patrick Ilunga" : "À désigner" }));
export const initialData = {
  users, requests, departments,
  settings: { reminderDays: 3, ceilingCDF: 1000000, ceilingUSD: 500, types: assistanceTypes },
  delegations: [{ id: "SUP-1", owner: "Patrick Ilunga", substitute: "Grâce Mbuyi", start: "2026-11-02", end: "2026-11-06" }],
  notifications: [{ id: "N1", role: "agent", title: "Votre demande est auprès du DG", text: "La Finance a vérifié votre demande de 150 000 CDF.", date: "2026-10-22T14:30:00", read: false, requestId: "BAM-2026-00042" }, { id: "N2", role: "agent", title: "Une correction est nécessaire", text: "Précisez les examens de la demande BAM-2026-00027.", date: "2026-10-02T10:00:00", read: false, requestId: "BAM-2026-00027" }, ...["responsable", "finance", "dg", "admin"].map(role => ({ id: `N-${role}`, role, title: role === "admin" ? "Comptes utilisateurs à jour" : "Des demandes attendent votre intervention", text: role === "admin" ? "Le dernier contrôle des comptes a été effectué." : "Consultez votre file de demandes pour poursuivre leur traitement.", date: "2026-10-23T09:00:00", read: false }))],
  audit: [{ id: "AUD-1", date: "2026-10-23T09:05:00", actor: "Grâce Mbuyi", action: "Vérification d'une demande", target: "BAM-2026-00042" }, { id: "AUD-2", date: "2026-10-22T16:00:00", actor: "Rhenard Munongo", action: "Mise à jour utilisateur", target: "AG-0098" }],
};