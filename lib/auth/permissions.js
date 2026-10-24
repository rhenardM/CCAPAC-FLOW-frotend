export const roles = ["AGENT", "RESPONSABLE", "FINANCE", "DG", "ADMIN"];
export const spaces = {
  agent: { label: "Agent", section: "Mon espace", name: "Mireille Kabongo", initials: "MK", items: [["", "Mes demandes", "FileText"], ["nouvelle", "Nouvelle demande", "FileText"], ["solde", "Mon solde annuel", "Wallet"]] },
  responsable: { label: "Responsable", section: "Validation", name: "Patrick Ilunga", initials: "PI", items: [["", "Tableau de bord", "LayoutGrid"], ["valider", "À valider", "ClipboardCheck"], ["historique", "Historique de l'équipe", "History"], ["equipe", "Mon équipe", "UsersRound"], ["absence", "Déclarer mon absence", "ArrowLeftRight"]] },
  finance: { label: "Finance", section: "Finance", name: "Grâce Mbuyi", initials: "GM", items: [["", "Tableau de bord", "LayoutGrid"], ["verifier", "À vérifier", "ClipboardCheck"], ["payer", "À payer", "Banknote"], ["caisse", "Journal de caisse", "History"], ["demandes", "Toutes les demandes", "FileText"], ["rapports", "Rapports", "ChartNoAxesColumn"], ["plafonds", "Alertes plafond", "Wallet"]] },
  dg: { label: "DG", section: "Direction", name: "Direction générale", initials: "DG", items: [["", "Tableau de bord", "LayoutGrid"], ["approuver", "À approuver", "ClipboardCheck"], ["historique", "Mes décisions", "History"], ["rapports", "Rapports", "ChartNoAxesColumn"], ["absence", "Déléguer une absence", "ArrowLeftRight"]] },
  admin: { label: "Admin", section: "Administration", name: "Rhenard Munongo", initials: "RM", items: [["", "Tableau de bord", "LayoutGrid"], ["utilisateurs", "Utilisateurs", "UsersRound"], ["import", "Importer des utilisateurs", "UsersRound"], ["departements", "Départements", "Building2"], ["suppleances", "Suppléances", "ArrowLeftRight"], ["parametres", "Paramètres", "Settings2"], ["audit", "Journal d'audit", "ListChecks"], ["demandes", "Toutes les demandes", "FileText"]] },
};
export function canAccess(role, space) {
  // Brancher ici la matrice des droits Symfony lorsque les restrictions seront activées.
  void role; void space;
  return true;
}