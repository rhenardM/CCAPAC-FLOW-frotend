export const demoSections = [
  { title: "Communs", screens: [
    ["C01", "Connexion", "/connexion"], ["C02", "Créer un compte", "/creation-compte"], ["C03", "Mot de passe oublié", "/mot-de-passe-oublie"], ["C04", "E-mail envoyé", "/email-envoye"], ["C05", "Nouveau mot de passe", "/nouveau-mot-de-passe"], ["C06", "Première connexion", "/premiere-connexion"], ["C07", "Profil", "/agent/profil"], ["C08", "Notifications et cloche", "/agent/notifications"], ["C09", "Page 404", "/page-introuvable"], ["C10", "Erreur", "/erreur"],
  ] },
  { title: "Mon espace", screens: [
    ["A01", "Mes demandes", "/agent"], ["A02", "Nouvelle demande", "/agent/nouvelle"], ["A03", "Modifier un brouillon", "/agent/demandes/BAM-2026-00046/modifier"], ["A04", "Détail et suivi", "/agent/demandes/BAM-2026-00042"], ["A05", "Corriger une demande", "/agent/demandes/BAM-2026-00027/modifier"], ["A06", "Mon solde annuel", "/agent/solde"],
  ] },
  { title: "Validation", screens: [
    ["R01", "Tableau de bord", "/responsable"], ["R02", "Demandes à valider", "/responsable/valider"], ["R03", "Détail à valider", "/responsable/demandes/BAM-2026-00044"], ["R04", "Dialogues de décision", "/responsable/demandes/BAM-2026-00044#decision"], ["R05", "Historique de l’équipe", "/responsable/historique"], ["R06", "Mon équipe", "/responsable/equipe"], ["R07", "Déclarer mon absence", "/responsable/absence"],
  ] },
  { title: "Finance", screens: [
    ["F01", "Tableau de bord", "/finance"], ["F02", "Demandes à vérifier", "/finance/verifier"], ["F03", "Détail de vérification", "/finance/demandes/BAM-2026-00039"], ["F04", "Demandes à payer", "/finance/payer"], ["F05", "Enregistrer un paiement", "/finance/paiement/BAM-2026-00035"], ["F06", "Reçu A4", "/finance/recu/BAM-2026-00031"], ["F07", "Journal de caisse", "/finance/caisse"], ["F08", "Toutes les demandes", "/finance/demandes"], ["F09", "Rapports et exports", "/finance/rapports"], ["F10", "Alertes plafond", "/finance/plafonds"], ["F11", "Fiche agent", "/finance/agents/AG-0123"],
  ] },
  { title: "Direction", screens: [
    ["D01", "Tableau de bord", "/dg"], ["D02", "Demandes à approuver", "/dg/approuver"], ["D03", "Détail à approuver", "/dg/demandes/BAM-2026-00042"], ["D04", "Mes décisions", "/dg/historique"], ["D05", "Rapports", "/dg/rapports"], ["D06", "Déléguer une absence", "/dg/absence"],
  ] },
  { title: "Administration", screens: [
    ["AD01", "Tableau de bord", "/admin"], ["AD02", "Utilisateurs", "/admin/utilisateurs"], ["AD03", "Créer un utilisateur", "/admin/utilisateurs/nouveau"], ["AD03b", "Modifier un utilisateur", "/admin/utilisateurs/AG-0123/modifier"], ["AD04", "Fiche utilisateur", "/admin/utilisateurs/AG-0123"], ["AD05", "Import Excel / CSV", "/admin/import"], ["AD06", "Départements", "/admin/departements"], ["AD07", "Créer un département", "/admin/departements/nouveau"], ["AD07b", "Modifier un département", "/admin/departements/DEP-1/modifier"], ["AD08", "Suppléances", "/admin/suppleances"], ["AD09", "Paramètres", "/admin/parametres"], ["AD10", "Journal d’audit", "/admin/audit"], ["AD10b", "Détail d’audit", "/admin/audit/AUD-1"], ["AD11", "Toutes les demandes", "/admin/demandes"],
  ] },
  { title: "Profils et notifications par espace", screens: ["responsable", "finance", "dg", "admin"].flatMap((role, index) => [[`P${index + 1}`, `Profil ${role}`, `/${role}/profil`], [`N${index + 1}`, `Notifications ${role}`, `/${role}/notifications`]]) },
];