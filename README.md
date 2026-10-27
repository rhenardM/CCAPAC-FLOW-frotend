# Portail CCAPAC

Prototype frontend Next.js App Router, JavaScript, Tailwind CSS, Plus Jakarta Sans et lucide-react. Aucun appel a une API metier.

## Demarrage et verification

Depuis `frontend` :

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Presentation : http://localhost:3000/demo. La racine `/` ouvre ce catalogue de 62 entrees. Chaque ecran dispose d'un code et d'un lien direct ; la definition exhaustive se trouve dans `lib/demo-pages.js`.

## Navigation et donnees

Tous les espaces sont visibles, en developpement comme en production. Aucun garde de route. Le selecteur **Voir en tant que** change l'identite affichee et ouvre l'espace correspondant sans masquer aucun menu. `lib/auth/permissions.js` centralise espaces et roles ; `canAccess` renvoie toujours `true`.

Le contexte `DemoProvider` dans `lib/use-data.js` partage l'etat entre les pages et ecoute les changements du stockage entre onglets. `lib/api/index.js` conserve les donnees dans `localStorage`, cle `ccapac-demo-v2`. L'ancienne cle v1 n'est pas effacee. Le bouton **Reinitialiser la demo** restaure 25 utilisateurs, 6 departements, 40 demandes couvrant les 9 statuts, paiements, notifications, suppleances et audit. Les dates initiales sont celles de la presentation d'octobre 2026.

Scenario : soumettre une demande Agent, valider dans Validation, transmettre au DG depuis Finance, approuver en Direction puis enregistrer les especes en Finance. Chaque mutation cree une notification et une entree d'audit. Le DG intervient sans seuil de montant. Les actions negatives exigent un commentaire. La devise du paiement reste celle de la demande ; tout ecart de montant exige une justification et la remise en main propre doit etre confirmee.

Les demandes en attente depuis plus de 48 heures portent la mention **Relancee**. Les relances sont des indicateurs locaux, sans envoi d'e-mail automatique. L'import utilise les colonnes `matricule`, `nom`, `email`, `departement`, `role`, et controle toutes les lignes avant creation atomique. CSV et XLSX sont acceptes ; un modele CSV est telechargeable depuis `/admin/import`.

Identifiants de demonstration : `AG-0123` / `GrandTambour2026!`. Les pages de compte et de mot de passe simulent le parcours, sans e-mail reel ni stockage des mots de passe. La creation de compte ajoute une demande d'acces en attente.

## Organisation

```text
app/(auth)/          Connexion, inscription, recuperation, premiere connexion
app/(app)/demo/      Catalogue de presentation
app/(app)/agent/     Demandes, brouillons, corrections et solde
app/(app)/responsable/ Validation, equipe, absences
app/(app)/finance/   Verification, paiements, caisse, recus et rapports
app/(app)/dg/        Indicateurs, approbations, rapports et delegation
app/(app)/admin/     Utilisateurs, import, organisation, parametres, audit
components/ui/       Composants accessibles et reutilisables
components/          Pages et coque partagees
lib/api/             API asynchrone fictive et validations metier
lib/auth/            Roles et definition des espaces
lib/mock/            Jeu de donnees initial
lib/export.js        Exports CSV, Excel XLSX, PDF et recus
lib/demo-pages.js    Catalogue exhaustif des codes et URL
public/logo.png      Logo officiel
tests/               Tests metier et import
```

## Design tokens

Tokens centralises dans `app/globals.css`, regles des espaces dans `app/workspaces.css` :

| Usage | Token | Valeur |
| --- | --- | --- |
| Fond | white | #FFFFFF |
| Surface / navigation | surface / sidebar | #FAF6F1 / #FCFBF9 |
| Texte | ink / secondary / muted | #1A1714 / #57534E / #78716C |
| Bordures | line / field | #ECE7E1 / #E7E2DC |
| Cuivre | copper / copper-light / copper-text | #CD935B / #F7EEE4 / #9A5F2B |
| Graphiques precedents | chart-light | #EAD6C0 |
| Champs / cartes / synthese | radius-field / card / summary | 12 / 16 / 20 px |

Les statuts utilisent les tokens pending, success, danger et neutral. Boutons principaux noirs, focus cuivre, transitions 150 ms, navigation mobile en tiroir. Les graphiques Recharts et exports gardent CDF et USD separes. Le logo seul est affiche dans la navigation, les formulaires d'acces et le recu. Le recu dispose d'une feuille d'impression A4 et d'un export PDF via jsPDF ; les rapports Excel utilisent write-excel-file.

## Etats de demonstration

Les pages chargees depuis le store affichent des squelettes, erreurs avec relance, listes vides et toasts. En developpement, ouvrir directement une URL avec `?etat=erreur` ou `?etat=vide` pour simuler ces etats. Les dialogues natifs gerent le focus, Echap et le retour au declencheur. L'impression masque la navigation et ne conserve que le recu.

## Branchement Symfony

Remplacer les implementations de `lib/api/index.js` par `fetch` en conservant leurs signatures. Les validations d'import sont partagees entre l'apercu et l'enregistrement dans `lib/api/import-rules.js`. Les transitions sont dans `lib/api/rules.js`.

Avant production : sessions securisees, autorisations serveur, validation des transitions et montants, stockage securise des pieces jointes, numerotation transactionnelle, gestion des mots de passe, envois d'e-mails et piste d'audit immuable. Brancher ensuite la matrice de permissions a l'endroit commente dans `canAccess`. Ce prototype ne doit contenir que des donnees fictives.
