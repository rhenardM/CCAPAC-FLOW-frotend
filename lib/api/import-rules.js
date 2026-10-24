import { roles } from "../auth/permissions.js";
export function inspectUsers(rows, data) {
  const ids = new Set(data.users.map(user => user.id)); const emails = new Set(data.users.map(user => user.email.toLowerCase()));
  return rows.map((row, index) => {
    const record = { id: String(row.matricule || "").trim().toUpperCase(), name: String(row.nom || "").trim(), email: String(row.email || "").trim().toLowerCase(), department: String(row.departement || "").trim(), role: String(row.role || "AGENT").trim().toUpperCase(), active: true, lastLogin: null };
    const errors = [];
    if (!/^AG-\d{4,}$/.test(record.id)) errors.push("Matricule invalide (AG-0000)");
    if (!record.name) errors.push("Nom manquant");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) errors.push("E-mail invalide");
    if (!roles.includes(record.role)) errors.push("Rôle inconnu");
    if (!data.departments.some(item => item.name === record.department)) errors.push("Département inconnu");
    if (ids.has(record.id)) errors.push("Matricule déjà utilisé");
    if (emails.has(record.email)) errors.push("E-mail déjà utilisé");
    ids.add(record.id); emails.add(record.email);
    return { id: index + 2, record, errors };
  });
}