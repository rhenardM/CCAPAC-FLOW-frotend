import test from "node:test";
import assert from "node:assert/strict";
import { validateRequest, validateTransition, formatAmount } from "../lib/api/rules.js";
import { requestAccountAccess, getData, saveRequest, transitionRequest, resetDemo } from "../lib/api/index.js";
import { canAccess } from "../lib/auth/permissions.js";
import { initialData } from "../lib/mock/data.js";
import { isReminded } from "../lib/api/rules.js";
import { inspectUsers } from "../lib/api/import-rules.js";
test("la Finance transmet au DG quel que soit le montant", () => {
  for (const amount of [1, 1000000]) { const request = { status: "EN_ATTENTE_FINANCE", amount }; assert.doesNotThrow(() => validateTransition(request, "EN_ATTENTE_DG", "finance")); assert.throws(() => validateTransition(request, "APPROUVEE", "finance")); }
});
test("le commentaire est obligatoire pour les décisions négatives", () => {
  for (const status of ["REJETEE", "A_CORRIGER"]) { assert.throws(() => validateTransition({ status: "EN_ATTENTE_DG" }, status, "dg", "  ")); assert.doesNotThrow(() => validateTransition({ status: "EN_ATTENTE_DG" }, status, "dg", "Montant à préciser")); }
});
test("paiement en espèces dans la devise et au montant approuvés", () => {
  const request = { status: "APPROUVEE", amount: 80, currency: "USD" };
  const payment = { amount: 80, currency: "USD", mode: "Espèces", confirmed: true, date: "2026-01-01" };
  assert.doesNotThrow(() => validateTransition(request, "PAYEE", "finance", "", payment));
  for (const invalid of [{ currency: "CDF" }, { mode: "Virement" }, { amount: 79 }, { confirmed: false }]) assert.throws(() => validateTransition(request, "PAYEE", "finance", "", { ...payment, ...invalid }));
});
test("annulation interdite après approbation", () => {
  assert.doesNotThrow(() => validateTransition({ status: "EN_ATTENTE_DG" }, "ANNULEE", "agent"));
  for (const status of ["APPROUVEE", "PAYEE"]) assert.throws(() => validateTransition({ status }, "ANNULEE", "agent"));
});
test("pièces jointes facultatives, type et taille contrôlés", () => {
  const payload = { type: "Examens", establishment: "Clinique", reason: "Soins", amount: 80, currency: "USD" };
  assert.doesNotThrow(() => validateRequest(payload));
  assert.throws(() => validateRequest({ ...payload, attachments: [{ type: "image/png", size: 5242881 }] }));
  assert.throws(() => validateRequest({ ...payload, amount: -1 }));
});
test("montants avec espaces insécables", () => { assert.equal(formatAmount(150000, "CDF"), "150\u00a0000\u00a0CDF"); assert.equal(formatAmount(80, "USD"), "80\u00a0USD"); });
test("démo complète, permissions ouvertes et relances après 48 heures", () => {
  assert.equal(initialData.users.length, 25); assert.equal(initialData.requests.length, 40); assert.equal(initialData.departments.length, 6);
  assert.equal(new Set(initialData.requests.map(request => request.status)).size, 9);
  assert.equal(canAccess("AGENT", "admin"), true);
  const request = { status: "EN_ATTENTE_DG", date: "2026-10-20T00:00:00Z", history: [] };
  assert.equal(isReminded(request, Date.parse("2026-10-22T00:00:00Z")), false);
  assert.equal(isReminded(request, Date.parse("2026-10-22T00:00:01Z")), true);
});
test("import : erreurs par ligne, doublons internes et existants", () => {
  const row = { matricule: "AG-0300", nom: "Agent Test", email: "test@example.com", departement: "Communication", role: "AGENT" };
  assert.equal(inspectUsers([row], initialData)[0].errors.length, 0);
  assert.equal(inspectUsers([row, row], initialData)[1].errors.length, 2);
  assert.ok(inspectUsers([{ ...row, matricule: "AG-0123" }], initialData)[0].errors.includes("Matricule déjà utilisé"));
  assert.ok(inspectUsers([{ ...row, departement: "Inconnu", role: "SUPER" }], initialData)[0].errors.length === 2);
});
test("circuit partagé, notifications, audit et écart de caisse justifié", async () => {
  const record = await saveRequest({ type: "Consultation", establishment: "Clinique", reason: "Soins", amount: 80, currency: "USD" });
  for (const [role, status] of [["responsable", "EN_ATTENTE_FINANCE"], ["finance", "EN_ATTENTE_DG"], ["dg", "APPROUVEE"]]) await transitionRequest(record.id, { role, status });
  const payment = { amount: 75, currency: "USD", mode: "Espèces", confirmed: true, date: new Date().toISOString().slice(0, 10) };
  await assert.rejects(transitionRequest(record.id, { role: "finance", status: "PAYEE", payment }), /justification/);
  await transitionRequest(record.id, { role: "finance", status: "PAYEE", payment: { ...payment, justification: "Solde non retiré par le bénéficiaire" } });
  const data = await getData();
  assert.equal(data.requests.find(item => item.id === record.id).payment.amount, 75);
  assert.equal(data.audit.filter(item => item.target === record.id).length, 5);
  for (const role of ["agent", "responsable", "finance", "dg"]) assert.ok(data.notifications.some(item => item.role === role && item.requestId === record.id));
  await resetDemo(); assert.equal((await getData()).requests.length, 40);
});
test("création : demande locale en attente, sans compte actif ni rôle privilégié", async () => {
  const payload = { name: " Agent Test ", identifier: "ag-9898", email: " TEST@example.com ", department: "Communication", role: "ADMIN", password: "NePasStocker" };
  const result = await requestAccountAccess(payload);
  assert.equal(result.simulated, true);
  assert.equal(result.request.role, "AGENT");
  assert.equal(result.request.status, "EN_ATTENTE");
  assert.equal(result.request.email, "test@example.com");
  assert.equal(result.request.password, undefined);
  const data = await getData();
  assert.ok(data.accessRequests.some(request => request.identifier === "AG-9898"));
  assert.ok(!data.users.some(user => user.id === "AG-9898"));
  await assert.rejects(requestAccountAccess(payload), /existe déjà/);
  await assert.rejects(requestAccountAccess({ ...payload, identifier: "AG-9899" }), /existe déjà/);
});
test("création : champs obligatoires et comptes existants contrôlés", async () => {
  await assert.rejects(requestAccountAccess(), /Vérifiez/);
  const payload = { name: "Agent Test", identifier: "AG-0123", email: "autre@example.com", department: "Communication" };
  await assert.rejects(requestAccountAccess(payload), /existe déjà/);
  for (const invalid of [{ name: " " }, { email: "invalide" }, { identifier: "123" }, { department: " " }]) await assert.rejects(requestAccountAccess({ ...payload, ...invalid }), /Vérifiez/);
});