import { formatAmount, formatDate, statusLabels } from "./api/rules.js";
export function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export async function exportRequests(requests, filename = "demandes") {
  const { default: Papa } = await import("papaparse");
  const csv = Papa.unparse(requests.map(request => ({ Numéro: request.id, Agent: request.agent, Département: request.department, Type: request.type, Montant: request.amount, Devise: request.currency, Statut: statusLabels[request.status], Date: formatDate(request.date) })), { delimiter: ";", escapeFormulae: true });
  downloadBlob(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}
export async function exportReceipt(request) {
  const { jsPDF } = await import("jspdf"); const doc = new jsPDF();
  const image = new Image(); image.src = "/logo.png"; await image.decode();
  const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
  const context = canvas.getContext("2d"); context.filter = "brightness(0)"; context.drawImage(image, 0, 0); doc.addImage(canvas.toDataURL("image/png"), "PNG", 18, 10, 56, 27);
  doc.setFontSize(11); doc.text("CCAPAC - Centre Culturel Grand Tambour", 20, 45); doc.text("Boulevard Triomphal, Kinshasa", 20, 52);
  doc.setFontSize(16); doc.text("RECU D'ASSISTANCE MEDICALE", 20, 70); doc.setFontSize(11);
  const lines = [`N° ${request.id}`, `Date : ${formatDate(request.payment.date)}`, `Beneficiaire : ${request.agent} - ${request.agentId}`, `Objet : ${request.type}`, "Mode : Especes", `Montant remis : ${formatAmount(request.payment.amount, request.currency).replaceAll("\u00a0", " ")}`, `Piece de caisse : ${request.payment.reference || "Non renseignee"}`];
  lines.forEach((line, index) => doc.text(line, 20, 84 + index * 12)); doc.line(20, 195, 90, 195); doc.line(115, 195, 185, 195); doc.text("Signature Finance", 20, 203); doc.text("Signature du beneficiaire", 115, 203); doc.save(`recu-${request.id}.pdf`);
}