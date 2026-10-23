import test from "node:test";
import assert from "node:assert/strict";
import { validateRequest, validateTransition, formatAmount } from "../lib/api/rules.js";
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