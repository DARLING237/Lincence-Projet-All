// ── Mock Data – BarResto Manager ──

// ── Auth ──
export const users = [
  { id: 1, nom: "Admin", prenom: "Patron", email: "admin@barresto.ci", password: "admin123", role: "admin", avatar: "AP" },
  { id: 2, nom: "Diallo", prenom: "Aminata", email: "aminata@barresto.ci", password: "staff123", role: "serveur", poste: "Serveuse", avatar: "AD" },
  { id: 3, nom: "Traoré", prenom: "Moussa", email: "moussa@barresto.ci", password: "staff123", role: "serveur", poste: "Serveur", avatar: "TM" },
  { id: 4, nom: "Koné", prenom: "Fatou", email: "fatou@barresto.ci", password: "staff123", role: "caissier", poste: "Caissière", avatar: "KF" },
  { id: 5, nom: "Coulibaly", prenom: "Ibrahim", email: "ibrahim@barresto.ci", password: "staff123", role: "cuisinier", poste: "Cuisinier", avatar: "CI" },
  { id: 6, nom: "Sylla", prenom: "Oumar", email: "oumar@barresto.ci", password: "staff123", role: "barman", poste: "Barman", avatar: "SO" },
];

// ── Tables ──
export const tables = [
  { id: 1, numero: "T1", places: 4, statut: "occupee", zone: "Salle principale", qrActif: true },
  { id: 2, numero: "T2", places: 2, statut: "libre", zone: "Salle principale", qrActif: true },
  { id: 3, numero: "T3", places: 6, statut: "reservee", zone: "Salle principale", qrActif: true },
  { id: 4, numero: "T4", places: 4, statut: "libre", zone: "Salle principale", qrActif: false },
  { id: 5, numero: "T5", places: 8, statut: "occupee", zone: "Terrasse", qrActif: true },
  { id: 6, numero: "T6", places: 2, statut: "libre", zone: "Terrasse", qrActif: true },
  { id: 7, numero: "T7", places: 4, statut: "occupee", zone: "Terrasse", qrActif: true },
  { id: 8, numero: "T8", places: 4, statut: "reservee", zone: "VIP", qrActif: true },
  { id: 9, numero: "T9", places: 6, statut: "libre", zone: "VIP", qrActif: true },
  { id: 10, numero: "Bar1", places: 3, statut: "occupee", zone: "Bar", qrActif: false },
  { id: 11, numero: "Bar2", places: 3, statut: "libre", zone: "Bar", qrActif: false },
  { id: 12, numero: "T12", places: 10, statut: "libre", zone: "Privé", qrActif: true },
];

// ── Produits ──
export const produits = [
  { id: 1, nom: "Burger Gourmet", prix: 3500, categorie: "Plats chauds", type_poste: "cuisine", dispo: true, bestseller: true, desc: "Bœuf charolais, cheddar affiné, sauce secrète", photo: "" },
  { id: 2, nom: "Poulet Braisé", prix: 4000, categorie: "Grillades", type_poste: "cuisine", dispo: true, bestseller: true, desc: "Poulet fermier mariné, épices maison", photo: "" },
  { id: 3, nom: "Poisson Braisé", prix: 5000, categorie: "Grillades", type_poste: "cuisine", dispo: false, bestseller: false, desc: "Bar entier braisé, sauce pimentée", photo: "" },
  { id: 4, nom: "Riz Cantonnais", prix: 3000, categorie: "Plats chauds", type_poste: "cuisine", dispo: true, bestseller: false, desc: "Riz sauté, crevettes, légumes", photo: "" },
  { id: 5, nom: "Attiéké Poisson", prix: 4500, categorie: "Plats chauds", type_poste: "cuisine", dispo: true, bestseller: true, desc: "Attiéké frais, poisson braisé, alloco", photo: "" },
  { id: 6, nom: "Frites Maison", prix: 1500, categorie: "Accompagnements", type_poste: "cuisine", dispo: true, bestseller: false, desc: "Frites fraîches, sauce au choix", photo: "" },
  { id: 7, nom: "Fondant Chocolat", prix: 2500, categorie: "Desserts", type_poste: "cuisine", dispo: true, bestseller: true, desc: "Cœur coulant, glace vanille", photo: "" },
  { id: 8, nom: "Salade Composée", prix: 2000, categorie: "Desserts", type_poste: "cuisine", dispo: true, bestseller: false, desc: "Mesclun, avocat, mangue, vinaigrette", photo: "" },
  { id: 9, nom: "Spritz", prix: 2000, categorie: "Cocktails", type_poste: "bar", dispo: true, bestseller: true, desc: "Aperol, prosecco, eau gazeuse", photo: "" },
  { id: 10, nom: "Mojito", prix: 2500, categorie: "Cocktails", type_poste: "bar", dispo: true, bestseller: true, desc: "Rhum, menthe, citron vert, sucre de canne", photo: "" },
  { id: 11, nom: "Cocktail BarResto", prix: 3000, categorie: "Cocktails", type_poste: "bar", dispo: true, bestseller: false, desc: "Recette secrète de la maison", photo: "" },
  { id: 12, nom: "Bière Flag", prix: 1000, categorie: "Bières", type_poste: "bar", dispo: true, bestseller: true, desc: "50cl, bien fraîche", photo: "" },
  { id: 13, nom: "Bière Castel", prix: 1200, categorie: "Bières", type_poste: "bar", dispo: true, bestseller: false, desc: "65cl", photo: "" },
  { id: 14, nom: "Coca-Cola", prix: 800, categorie: "Softs", type_poste: "bar", dispo: true, bestseller: false, desc: "33cl", photo: "" },
  { id: 15, nom: "Jus de Fruits", prix: 1500, categorie: "Softs", type_poste: "bar", dispo: true, bestseller: false, desc: "Mangue ou bissap frais", photo: "" },
];

export const categories = ["Plats chauds", "Grillades", "Accompagnements", "Desserts", "Cocktails", "Bières", "Softs"];

// ── Commandes en cours (Staff) ──
export const commandesEnCours = [
  { id: 1047, table: "T1", items: [{ nom: "Burger Gourmet", qte: 2, type_poste: "cuisine" }, { nom: "Spritz", qte: 2, type_poste: "bar" }], total: 11000, statut: "en preparation", heure: "19:30", serveur: "Aminata", temps: 8 },
  { id: 1046, table: "T5", items: [{ nom: "Poulet Braisé", qte: 1, type_poste: "cuisine" }, { nom: "Attiéké Poisson", qte: 1, type_poste: "cuisine" }, { nom: "Mojito", qte: 2, type_poste: "bar" }, { nom: "Fondant Chocolat", qte: 2, type_poste: "cuisine" }], total: 16000, statut: "en preparation", heure: "20:15", serveur: "Moussa", temps: 15 },
  { id: 1045, table: "Bar1", items: [{ nom: "Bière Flag", qte: 3, type_poste: "bar" }, { nom: "Cocktail BarResto", qte: 1, type_poste: "bar" }], total: 6000, statut: "en attente", heure: "20:45", serveur: "Fatou", temps: 2 },
  { id: 1048, table: "T7", items: [{ nom: "Riz Cantonnais", qte: 2, type_poste: "cuisine" }, { nom: "Coca-Cola", qte: 2, type_poste: "bar" }], total: 7600, statut: "servie", heure: "18:00", serveur: "Aminata", temps: 25 },
];

// ── Commandes récentes (Admin) ──
export const commandesRecentes = [
  { id: "CMD-1047", table: "T1", montant: 11000, statut: "payee", heure: "21:32", serveur: "Aminata" },
  { id: "CMD-1046", table: "T5", montant: 16000, statut: "en preparation", heure: "21:15", serveur: "Moussa" },
  { id: "CMD-1045", table: "Bar1", montant: 6000, statut: "en attente", heure: "20:45", serveur: "Fatou" },
  { id: "CMD-1044", table: "T7", montant: 7600, statut: "servie", heure: "20:30", serveur: "Aminata" },
  { id: "CMD-1043", table: "T3", montant: 4500, statut: "en preparation", heure: "20:00", serveur: "Moussa" },
  { id: "CMD-1042", table: "T8", montant: 7200, statut: "payee", heure: "19:15", serveur: "Fatou" },
  { id: "CMD-1041", table: "Bar2", montant: 2000, statut: "payee", heure: "18:50", serveur: "Aminata" },
  { id: "CMD-1040", table: "T2", montant: 9600, statut: "annulee", heure: "18:20", serveur: "Moussa" },
];

// ── Stats mensuelles ──
export const statsMensuelles = {
  ca: 4520000,
  caMoisPrecedent: 3890000,
  depenses: 2780000,
  benefice: 1740000,
  beneficeMoisPrecedent: 1250000,
  nombreCommandes: 342,
  nombreCommandesMoisPrecedent: 298,
  panierMoyen: 13216,
  panierMoyenMoisPrecedent: 13054,
  tablesOccupees: 4,
  tablesTotal: 12,
  margeBrute: 38.5,
  depensesStaff: 1060000,
  depensesFournisseurs: 1450000,
  depensesImpots: 270000,
};

// ── Stats Staff (journalière) ──
export const statsStaff = {
  commandesDuJour: 28,
  commandesHier: 22,
  caJour: 312000,
  caJourPrecedent: 268000,
  tablesEnService: 4,
  tempsMoyenPrep: 12, // minutes
  tauxAnnulation: 4.2,
};

export const revenusData = [
  { mois: "Jan", ca: 3200000, depenses: 2100000 },
  { mois: "Fev", ca: 2800000, depenses: 1900000 },
  { mois: "Mar", ca: 3500000, depenses: 2300000 },
  { mois: "Avr", ca: 3100000, depenses: 2000000 },
  { mois: "Mai", ca: 3800000, depenses: 2500000 },
  { mois: "Jun", ca: 4100000, depenses: 2600000 },
  { mois: "Jul", ca: 3900000, depenses: 2400000 },
  { mois: "Aoû", ca: 4200000, depenses: 2700000 },
  { mois: "Sep", ca: 3600000, depenses: 2200000 },
  { mois: "Oct", ca: 3890000, depenses: 2600000 },
  { mois: "Nov", ca: 4200000, depenses: 2650000 },
  { mois: "Déc", ca: 4520000, depenses: 2780000 },
];

export const ventesParCategorie = [
  { nom: "Cocktails", montant: 980000, couleur: "#8B5CF6", part: 22 },
  { nom: "Grillades", montant: 1150000, couleur: "#F59E0B", part: 25 },
  { nom: "Plats chauds", montant: 870000, couleur: "#10B981", part: 19 },
  { nom: "Bières", montant: 620000, couleur: "#3B82F6", part: 14 },
  { nom: "Softs", montant: 380000, couleur: "#6366F1", part: 8 },
  { nom: "Desserts", montant: 520000, couleur: "#EC4899", part: 12 },
];

export const commandesHeure = [
  { heure: "12h", commandes: 18 },
  { heure: "13h", commandes: 32 },
  { heure: "14h", commandes: 15 },
  { heure: "15h", commandes: 8 },
  { heure: "16h", commandes: 5 },
  { heure: "17h", commandes: 12 },
  { heure: "18h", commandes: 22 },
  { heure: "19h", commandes: 45 },
  { heure: "20h", commandes: 58 },
  { heure: "21h", commandes: 42 },
  { heure: "22h", commandes: 28 },
  { heure: "23h", commandes: 15 },
];

export const personnel = [
  { id: 1, nom: "Diallo", prenom: "Aminata", poste: "Serveuse", email: "aminata@barresto.ci", telephone: "+225 07 01 02 03", salaire: 150000, statut: "present", dateEmbauche: "2025-06-15", heureArrivee: "08:00", heureDepart: null },
  { id: 2, nom: "Traoré", prenom: "Moussa", poste: "Serveur", email: "moussa@barresto.ci", telephone: "+225 07 02 03 04", salaire: 150000, statut: "present", dateEmbauche: "2025-07-01", heureArrivee: "08:15", heureDepart: null },
  { id: 3, nom: "Koné", prenom: "Fatou", poste: "Caissière", email: "fatou@barresto.ci", telephone: "+225 05 01 02 03", salaire: 180000, statut: "present", dateEmbauche: "2025-05-10", heureArrivee: "07:45", heureDepart: null },
  { id: 4, nom: "Coulibaly", prenom: "Ibrahim", poste: "Cuisinier", email: "ibrahim@barresto.ci", telephone: "+225 05 02 03 04", salaire: 250000, statut: "present", dateEmbauche: "2025-03-01", heureArrivee: "07:30", heureDepart: null },
  { id: 5, nom: "Sylla", prenom: "Oumar", poste: "Barman", email: "oumar@barresto.ci", telephone: "+225 07 03 04 05", salaire: 180000, statut: "absent", dateEmbauche: "2025-08-20", heureArrivee: null, heureDepart: null },
  { id: 6, nom: "Diarra", prenom: "Aïssatou", poste: "Serveuse", email: "aissata@barresto.ci", telephone: "+225 07 04 05 06", salaire: 150000, statut: "conge", dateEmbauche: "2025-09-01", heureArrivee: null, heureDepart: null },
];

export const salariesMois = [
  { id: 1, employe: "Diallo Aminata", poste: "Serveuse", montant: 150000, statut: "en attente", dateGeneration: "2026-01-01" },
  { id: 2, employe: "Traoré Moussa", poste: "Serveur", montant: 150000, statut: "en attente", dateGeneration: "2026-01-01" },
  { id: 3, employe: "Koné Fatou", poste: "Caissière", montant: 180000, statut: "paye", dateGeneration: "2026-01-01", datePaiement: "2026-01-05" },
  { id: 4, employe: "Coulibaly Ibrahim", poste: "Cuisinier", montant: 250000, statut: "en attente", dateGeneration: "2026-01-01" },
  { id: 5, employe: "Sylla Oumar", poste: "Barman", montant: 180000, statut: "en attente", dateGeneration: "2026-01-01" },
];

export const alertesStock = [
  { id: 1, produit: "Coca-Cola", stockActuel: 5, stockMin: 20, unite: "bouteilles", fournisseur: "BOCCA CI" },
  { id: 2, produit: "Poulet", stockActuel: 3, stockMin: 10, unite: "kg", fournisseur: "SICORAM" },
  { id: 3, produit: "Bière Flag", stockActuel: 8, stockMin: 24, unite: "casiers", fournisseur: "CBEF" },
];

export const stockProduits = [
  { id: 1, nom: "Bœuf haché", stockActuel: 8, stockMin: 5, unite: "kg", dernierRavitaillement: "2026-01-02" },
  { id: 2, nom: "Poulet", stockActuel: 3, stockMin: 10, unite: "kg", dernierRavitaillement: "2025-12-28", alerte: true },
  { id: 3, nom: "Poisson", stockActuel: 6, stockMin: 4, unite: "kg", dernierRavitaillement: "2026-01-03" },
  { id: 4, nom: "Frites", stockActuel: 15, stockMin: 10, unite: "kg", dernierRavitaillement: "2026-01-01" },
  { id: 5, nom: "Coca-Cola", stockActuel: 5, stockMin: 20, unite: "bouteilles", dernierRavitaillement: "2025-12-20", alerte: true },
  { id: 6, nom: "Bière Flag", stockActuel: 8, stockMin: 24, unite: "casiers", dernierRavitaillement: "2025-12-25", alerte: true },
  { id: 7, nom: "Rhum", stockActuel: 4, stockMin: 2, unite: "bouteilles", dernierRavitaillement: "2025-12-15" },
  { id: 8, nom: "Aperol", stockActuel: 2, stockMin: 1, unite: "bouteilles", dernierRavitaillement: "2025-12-10" },
  { id: 9, nom: "Chocolat pâtissier", stockActuel: 3, stockMin: 2, unite: "kg", dernierRavitaillement: "2025-12-30" },
];

export const ravitaillements = [
  { id: 1, fournisseur: "SICORAM", date: "2025-12-28", montant: 185000, nbFacture: "FAC-2025-0142", produits: 5 },
  { id: 2, fournisseur: "CBEF", date: "2025-12-25", montant: 320000, nbFacture: "FAC-2025-0891", produits: 120 },
  { id: 3, fournisseur: "BOCCA CI", date: "2025-12-20", montant: 95000, nbFacture: "FAC-2025-0654", produits: 3 },
  { id: 4, fournisseur: "PRODIST", date: "2025-12-18", montant: 67000, nbFacture: "FAC-2025-0023", produits: 8 },
];

export const fournisseurs = [
  { id: 1, nom: "BOCCA CI", contact: "+225 07 00 00 00", email: "contact@bocca.ci", adresse: "Abidjan, Plateau", type: "Boissons", livraisons: 12, totalAchats: 1140000 },
  { id: 2, nom: "SICORAM", contact: "+225 05 00 00 00", email: "contact@sicoram.ci", adresse: "Abidjan, Treichville", type: "Viandes & Volailles", livraisons: 8, totalAchats: 1480000 },
  { id: 3, nom: "CBEF", contact: "+225 01 00 00 00", email: "commandes@cbef.ci", adresse: "Abidjan, Zone 4", type: "Boissons", livraisons: 15, totalAchats: 4800000 },
  { id: 4, nom: "PRODIST", contact: "+225 07 01 01 01", email: "info@prodist.ci", adresse: "Abidjan, Cocody", type: "Divers", livraisons: 6, totalAchats: 402000 },
];

export const impots = [
  { id: 1, libelle: "Taxe municipale", montant: 85000, echeance: "2026-01-15", statut: "en attente" },
  { id: 2, libelle: "TVA Décembre", montant: 210000, echeance: "2026-01-05", statut: "en retard" },
  { id: 3, libelle: "Patente 2026", montant: 450000, echeance: "2026-03-01", statut: "en attente" },
];

// ── Données Client QR (panier, commande courante) ──
export function getTicketCommandes(table) {
  return commandesEnCours.filter((c) => c.table === table);
}

// ── Helpers ──
export function formatMontant(montant) {
  const value = typeof montant === "number" ? montant : parseFloat(montant) || 0;
  return new Intl.NumberFormat("fr-FR").format(value) + " F";
}

export function formatPourcentage(valeur, precedent) {
  if (!valeur || !precedent || precedent === 0) return null;
  const pct = ((valeur - precedent) / precedent) * 100;
  return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
}

export function formatHeure(heures, minutes) {
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function tempsDepuis(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}
