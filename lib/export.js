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
export async function exportReport(requests, { format = "xlsx", cash = false, title = "Rapport" } = {}) {
  const headers = ["Numéro", "Agent", "Département", "Type", "Montant", "Devise", "Statut", "Date"];
  const rows = requests.map(request => [request.id, request.agent, request.department, request.type, cash ? request.payment.amount : request.amount, request.currency, statusLabels[request.status], formatDate(cash ? request.payment.date : request.date)]);
  if (format === "xlsx") {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    await writeXlsxFile([headers.map(value => ({ value, fontWeight: "bold" })), ...rows.map(row => row.map(value => ({ value, type: typeof value === "number" ? Number : String })))], { fileName: `${title}.xlsx`, columns: headers.map(() => ({ width: 24 })) });
    return;
  }
  const { jsPDF } = await import("jspdf"); const doc = new jsPDF(); let position = 25;
  doc.setFontSize(16); doc.text(title, 14, 15); doc.setFontSize(10);
  for (const row of rows) {
    const lines = doc.splitTextToSize(row.join(" | ").replaceAll("\u00a0", " "), 180);
    if (position + lines.length * 5 > 275) { doc.addPage(); position = 20; }
    doc.text(lines, 14, position); position += lines.length * 5 + 6;
  }
  if (position > 250) { doc.addPage(); position = 20; }
  for (const currency of ["CDF", "USD"]) { const total = requests.filter(request => request.currency === currency).reduce((sum, request) => sum + (cash ? request.payment.amount : request.amount), 0); doc.text(`Total ${currency} : ${formatAmount(total, currency).replaceAll("\u00a0", " ")}`, 14, position); position += 8; }
  doc.save(`${title}.pdf`);
}