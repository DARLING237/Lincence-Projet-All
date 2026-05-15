# BarResto Manager — Documentation Complete

> Systeme de gestion de bar/restaurant — Contexte Cameroun (prix en F CFA, paiement Orange Money/MTN MoMo via CamPay)

---

## 1. CARTOGRAPHIE COMPLÈTE DU PROJET

### 1.1 Arborescence

```
bar-restaurant/
│
├── backend/                              # API Express.js (port 3000)
│   ├── server.js                         # Point d'entree — monte tous les middlewares + routes
│   ├── database.sql                      # Schema MySQL + donnees de test (seed)
│   ├── .env / .env.example              # Variables de configuration
│   ├── package.json                      # Dep endances backend
│   │
│   ├── config/
│   │   ├── db.js                         # Pool de connexions MySQL (mysql2)
│   │   └── logger.js                     # Configuration Winston (logs + audit)
│   │
│   ├── middleware/
│   │   ├── auth.js                       # JWT : authenticate() + requireRole()
│   │   ├── validate.js                   # Validation schemas Zod
│   │   ├── upload.js                     # Multer — upload photos produits (5MB max)
│   │   ├── requestLogger.js              # Log chaque requete avec UUID + duree
│   │   └── auditLogger.js                # Audit trail sur operations sensibles
│   │
│   ├── routes/
│   │   ├── auth.js                       # Login, register, change-password, heartbeat
│   │   ├── menu.js                       # Categories + produits CRUD + photo upload
│   │   ├── tables.js                     # Tables CRUD + statut + QR
│   │   ├── commandes.js                  # Commandes CRUD + paiement + Campay
│   │   ├── stock.js                      # Stock produits + ravitaillements + mouvements
│   │   ├── fournisseurs.js               # Fournisseurs CRUD + historique livraisons
│   │   ├── finances.js                   # Transactions + bilan + impots
│   │   ├── statistiques.js               # Stats admin/journalier/CA/rapports
│   │   ├── personnel.js                  # Employes + presences + salaires
│   │   └── inventaire.js                 # Inventaires stock (theorique vs reel)
│   │
│   ├── services/
│   │   ├── campay.js                     # Paiement mobile Cameroun (OM/Momo)
│   │   └── stock.js                      # Decrement auto du stock a chaque commande
│   │
│   ├── scripts/                          # Scripts de migration/maintenance
│   │   ├── backup-db.js                  # Backup/restore base de donnees
│   │   ├── hash-passwords.js             # Hash les mots de passe en clair
│   │   ├── add-first-login.sql/.js       # Ajout colonne first_login
│   │   ├── add-last-seen.sql/.js         # Ajout colonne last_seen
│   │   ├── add-payment.sql               # Ajout colonne mode_paiement
│   │   ├── campay-integration.sql        # Table campay_solde
│   │   ├── run-campay-migration.js       # Exec migration campay
│   │   └── clean-photos.js               # Nettoyage photos orphelines
│   │
│   ├── tests/                            # Tests Jest
│   │   ├── jest.setup.js                 # Configuration Jest
│   │   └── middleware/                   # Tests des middlewares
│   │
│   ├── uploads/menu/                     # Photos des produits (multer)
│   └── logs/                             # Logs Winston (app, error, audit)
│
├── frontend/                             # React + Vite + Tailwind (port 5173)
│   ├── vite.config.js                    # Config Vite + proxy /api → localhost:3000
│   ├── package.json                      # Dep endances frontend
│   │
│   └── src/
│       ├── main.jsx                      # Point d'entree React
│       ├── App.jsx                       # Router + guards (RequireAuth)
│       ├── api.js                        # Helper fetch avec token JWT
│       │
│       ├── store/
│       │   └── appStore.js               # Zustand — etat global + actions API
│       │
│       ├── data/
│       │   └── mockData.js               # Donnees mock (fallback + helpers)
│       │
│       ├── lib/
│       │   └── utils.js                  # Fonction cn() — clsx + tailwind-merge
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AdminLayout.jsx        # Sidebar admin (6 nav items) + <Outlet />
│       │   │   └── StaffLayout.jsx        # Sidebar staff (4 nav items) + <Outlet />
│       │   └── ui/
│       │       ├── badge.jsx              # Badge colore (statut commande, table, etc.)
│       │       ├── statCard.jsx           # Carte KPI avec tendance
│       │       ├── button.jsx             # (existe mais non utilise dans le code)
│       │       └── card.jsx               # (existe mais non utilise dans le code)
│       │
│       └── pages/
│           ├── Login.jsx                  # Page de connexion (email + mdp)
│           ├── ChangePassword.jsx         # Forcer changement mdp (first_login)
│           ├── ClientQR.jsx               # Menu client via QR code (pas d'auth)
│           ├── AdminDashboard.jsx         # Dashboard admin (KPIs + graphiques)
│           ├── Finances.jsx               # Page finances admin (CA, benefice, impots)
│           ├── Rapports.jsx               # Rapports (journalier/mensuel/annuel + CSV)
│           ├── Personnel.jsx              # Employes + salaires (ajout, edition, paiement)
│           ├── Stock.jsx                  # Stock + fournisseurs + ravitaillements
│           ├── MenuAdmin.jsx              # Gestion menu (CRUD produits, bestseller, dispo)
│           ├── QRCodes.jsx                # Generation QR codes par table
│           ├── StaffDashboard.jsx         # Dashboard staff (mes commandes, salles)
│           ├── StaffCommandes.jsx         # Liste commandes + nouvelle commande + paiement
│           ├── StaffBar.jsx               # Drinks tickets — ce que le bar doit preparer
│           ├── StaffTables.jsx            # Plan de salle — tables, zones, statuts
│           ├── AdminPlaceholders.jsx      # Composants placeholder admin (non utilises)
│           └── StaffPlaceholders.jsx      # Composants placeholder staff (non utilises)
```

### 1.2 Tableau des fichiers — role et communication

| Fichier | Role en 1 phrase | Communique avec |
|---------|------------------|-----------------|
| `backend/server.js` | Point d'entree API — monte middlewares + routes | Tout le backend |
| `backend/config/db.js` | Pool MySQL (mysql2/promise) | Toutes les routes |
| `backend/config/logger.js` | Winston : logs console/fichier + audit file | server.js, middleware |
| `backend/middleware/auth.js` | Verification JWT + controle de role | 9/10 routes |
| `backend/middleware/validate.js` | Validation body avec schemas Zod | auth, menu, tables, stock, commandes, etc. |
| `backend/middleware/upload.js` | Multer — upload photo produits (5MB JPEG/PNG/WebP/GIF) | routes/menu.js |
| `backend/middleware/requestLogger.js` | Log chaque requete avec ID unique + timing | server.js |
| `backend/middleware/auditLogger.js` | Audit trail sur operations sensibles (paiement, registration) | auth, personnel, finances, stock |
| `backend/routes/auth.js` | Login, register, change-password, heartbeat | bcryptjs, jwt, pool |
| `backend/routes/menu.js` | CRUD categories + produits avec upload photo | pool, validate, upload |
| `backend/routes/tables.js` | CRUD tables (zones, statut, QR) | pool, validate |
| `backend/routes/commandes.js` | Gestion commandes + paiement (especes/mobile money) | pool, validate, camPay, stock |
| `backend/routes/stock.js` | Stock produits + ravitaillements auto | pool, validate, audit |
| `backend/routes/fournisseurs.js` | Fournisseurs CRUD + historique livraisons | pool, validate |
| `backend/routes/finances.js` | Transactions + bilan financier + impots | pool, validate, audit |
| `backend/routes/statistiques.js` | Stats admin + journalier + CA + rapports detailles | pool |
| `backend/routes/personnel.js` | Employes + presences + salaires | pool, validate, audit |
| `backend/routes/inventaire.js` | Inventaires stock (theorique vs reel) | pool, validate |
| `backend/services/campay.js` | API paiement mobile Cameroun (OM + MoMo) | axios |
| `backend/services/stock.js` | Decrement auto du stock quand commande passee | pool, produits_stock |
| `frontend/src/main.jsx` | Monte l'app React | App.jsx |
| `frontend/src/App.jsx` | Router + guards + heartbeat | Tous les layouts + pages |
| `frontend/src/api.js` | Fonction apiFetch avec JWT | Non utilise (doublon dans appStore) |
| `frontend/src/store/appStore.js` | Zustand — etat global + toutes les actions API | Tous les composants |
| `frontend/src/data/mockData.js` # Donnees mock + helpers formatMontant | Tous les composants UI |
| `frontend/src/lib/utils.js` | Fonction cn() pour fusionner classes Tailwind | badge.jsx, statCard.jsx |
| `frontend/src/components/layout/AdminLayout.jsx` | Sidebar admin (fond sombre, 6 items) | Zustand, react-router |
| `frontend/src/components/layout/StaffLayout.jsx` | Sidebar staff (fond clair, 4 items) | Zustand, react-router |
| `frontend/src/components/ui/badge.jsx` | Badge colore selon statut | Tous les composants |
| `frontend/src/components/ui/statCard.jsx` | Carte KPI avec icone + tendance | AdminDashboard, Finances |
| `frontend/src/pages/Login.jsx` | Page login (email + mdp) → redirige selon role | appStore, API /auth/login |
| `frontend/src/pages/ChangePassword.jsx` | Force changement de mdp au premier login | API /auth/change-password |
| `frontend/src/pages/ClientQR.jsx` | Menu mobile pour clients (scan QR table) | API /menu/produits, /commandes |
| `frontend/src/pages/AdminDashboard.jsx` | Dashboard admin (4 KPIs + graphiques + alertes) | API /stats |
| `frontend/src/pages/Finances.jsx` | Page finances (CA, depenses, benefice, impots, transactions) | API /stats, /finances |
| `frontend/src/pages/Rapports.jsx` | Rapports journalier/mensuel/annuel (chart + table + CSV) | API /stats/rapport |
| `frontend/src/pages/Personnel.jsx` | Fiches employes + tab salaires (paiement, edition) | API /personnel, /auth/register |
| `frontend/src/pages/Stock.jsx` | Tab stock + tab fournisseurs + modal ravitaillement | API /stock, /fournisseurs |
| `frontend/src/pages/MenuAdmin.jsx` | Grid de produits avec CRUD inline | API /menu |
| `frontend/src/pages/QRCodes.jsx` | Grid de QR codes par table (telechargement PNG) | API /tables |
| `frontend/src/pages/StaffDashboard.jsx` | Dashboard staff (stats du jour + mes commandes + acces rapide) | API /commandes, /stats |
| `frontend/src/pages/StaffCommandes.jsx` | Liste commandes + nouvelle commande + modal paiement | API /commandes, /tables, /menu |
| `frontend/src/pages/StaffBar.jsx` | Tickets de boissons pour le barman (tickets avec timer) | appStore (state) |
| `frontend/src/pages/StaffTables.jsx` | Plan de salle interactif (zones, statuts, detail) | appStore (tables) |

---

## 2. BASE DE DONNÉES — NIVEAU CHIRURGICAL

### 2.1 Schema visuel

```
┌─────────────────┐     ┌─────────────────┐     ┌────────────────────┐
│  utilisateurs   │     │   tables_salle  │     │     categories     │
├─────────────────┤     ├─────────────────┤     ├────────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)            │
│ nom             │     │ numero (UNIQUE) │     │ nom (UNIQUE)       │
│ prenom          │     │ places          │     │ type_poste (ENUM)  │
│ email (UNIQUE)  │     │ zone            │     │ ordre_affiche      │
│ mot_de_passe    │     │ statut (ENUM)   │     └────────┬───────────┘
│ role (ENUM)     │     │ qr_actif        │              │
│ poste           │     └───────┬─────────┘              │
│ telephone       │             │                        │
│ date_embauche   │             │                        │
│ avatar          │             │                        ▼
│ actif           │             │             ┌────────────────────┐
│ first_login     │             │             │   produits_menu    │
│ last_seen       │             │     ┌───────┴────────────────────┤
│ date_creation   │             │     │ id (PK)                    │
└───────┬─────────┘             │     │ categorie_id (FK)          │
        │                       │     │ nom, desc, prix            │
        │                       │     │ type_poste (ENUM)          │
        │                       │     │ dispo, bestseller, photo   │
        │                       ▼     └─────────────┬──────────────┘
        │              ┌─────────────────┐          │
        │              │    commandes    │          │
        │     ┌────────┴────────────────┤          │
        │     │ id (PK)                 │          │
        │     │ table_id (FK→NULL)      │          │
        │     │ serveur_id (FK)         │          │
        │     │ statut (ENUM)           │          │
        │     │ total, heure, date      │          │
        │     │ source, note            │          │
        │     └──────────┬──────────────┘          │
        │                │                         │
        ▼                ▼                         ▼
┌───────────────┐  ┌─────────────────────┐  ┌─────────────┐
│   presences   │  │  commande_items     │  │salaires     │
├───────────────┤  ├─────────────────────┤  ├─────────────┤
│ id (PK)       │  │ id (PK)             │  │ id (PK)     │
│ personnel(FK) │  │ commande_id (FK)    │  │ personne(FK)│
│ date          │  │ produit_menu_id(FK) │  │ mois_annee  │
│ heure_arrivee │  │ quantite, prix      │  │ montant     │
│ heure_depart  │  │ type_poste, statut  │  │ statut      │
│ statut (ENUM) │  └─────────────────────┘  ├─────────────┤
└───────────────┘                           │date_gen/pmt │
                                            └─────────────┘

┌──────────────────┐    ┌──────────────────────┐
│  fournisseurs    │    │   produits_stock     │
├──────────────────┤    ├──────────────────────┤
│ id (PK)          │    │ id (PK)              │
│ nom (UNIQUE)     │    │ nom, unite           │
│ contact, email   │    │ stock_actuel/min     │
│ adresse, type    │    │ dernier_rav., alerte │
└────────┬─────────┘    └──────────┬───────────┘
         │                         │
         ▼                         ▼
┌───────────────────────┐   ┌──────────────────────┐
│  ravitaillements      │   │ mouvements_stock     │
├───────────────────────┤   ├──────────────────────┤
│ id (PK)               │   │ id (PK)              │
│ fournisseur_id (FK)   │   │ produit_stock_id(FK) │
│ date, montant         │   │ type (entree/sortie) │
│ nb_facture, photo     │   │ quantite, raison     │
└──────────┬────────────┘   │ date                 │
           │                └──────────────────────┘
           ▼
┌───────────────────────┐    ┌──────────────────┐
│ ravitaillement_details│    │   inventaires    │
├───────────────────────┤    ├──────────────────┤
│ id (PK)               │    │ id (PK)          │
│ ravitaillement_id(FK) │    │ produit_stock(FK)│
│ produit_stock_id (FK) │    │ stock_theo/reel  │
│ quantite              │    │ ecart, note      │
└───────────────────────┘    │ manageur_id (FK) │
                             └──────────────────┘

┌──────────────────┐    ┌──────────────────────┐
│  impots_taxes    │    │   transactions       │
├──────────────────┤    ├──────────────────────┤
│ id (PK)          │    │ id (PK)              │
│ libelle          │    │ type_op (entree/s.)  │
│ montant          │    │ categorie            │
│ echeance         │    │ montant, reference   │
│ statut (ENUM)    │    │ description, date    │
│ date_paiement    │    └──────────────────────┘
└──────────────────┘
```

### 2.2 Colonnes detaillées par table

#### utilisateurs
| Colonne | Type | Contrainte | Usage |
|---------|------|------------|-------|
| id | INT | PK AUTO_INCREMENT | Identifiant unique utilisateur |
| nom | VARCHAR(100) | NOT NULL | Nom de famille |
| prenom | VARCHAR(100) | NOT NULL | Prenom |
| email | VARCHAR(150) | UNIQUE NOT NULL | Email de connexion |
| mot_de_passe | VARCHAR(255) | NOT NULL | Hash bcrypt (fallback texte clair en dev) |
| role | ENUM | NOT NULL | `admin`, `serveur`, `caissier`, `barman` |
| poste | VARCHAR(100) | NULL | Ex: "Serveuse", "Gerant", "Barman" |
| telephone | VARCHAR(30) | NULL | Numero de tel |
| date_embauche | DATE | NULL | Date d'embauche |
| avatar | VARCHAR(5) | NULL | Initiales (ex: "AP") |
| actif | BOOLEAN | DEFAULT TRUE | Compte actif/inactif |
| first_login | TINYINT(1) | DEFAULT 0 | Force changement mdp au premier login |
| last_seen | TIMESTAMP | NULL | Derniere activite (pour indicator "online") |
| date_creation | TIMESTAMP | DEFAULT NOW() | Date de creation du compte |

#### tables_salle
| Colonne | Type | Contrainte | Usage |
|---------|------|------------|-------|
| id | INT | PK AUTO_INCREMENT | Identifiant table |
| numero | VARCHAR(10) | UNIQUE NOT NULL | Ex: "T1", "Bar1" |
| places | INT | NOT NULL DEFAULT 2 | Nombre de places assises |
| zone | VARCHAR(50) | NOT NULL | "Salle principale", "Terrasse", "VIP", "Bar", "Prive" |
| statut | ENUM | DEFAULT 'libre' | `libre`, `occupee`, `reservee` |
| qr_actif | BOOLEAN | DEFAULT TRUE | QR code actif pour cette table |

#### categories
| Colonne | Type | Contrainte | Usage |
|---------|------|------------|-------|
| id | INT | PK AUTO_INCREMENT | ID categorie |
| nom | VARCHAR(80) | UNIQUE NOT NULL | "Cocktails", "Bieres", etc. |
| type_poste | ENUM | NOT NULL | Toujours "bar" dans ce projet |
| ordre_affiche | INT | DEFAULT 0 | Ordre d'affichage dans le menu |

#### produits_menu
| Colonne | Type | Contrainte | Usage |
|---------|------|------------|-------|
| id | INT | PK AUTO_INCREMENT | ID produit |
| categorie_id | INT | FK → categories.id | Categorie du produit |
| nom | VARCHAR(120) | NOT NULL | Nom affiché |
| description | TEXT | NULL | Description du produit |
| prix | BIGINT | NOT NULL | Prix en F CFA |
| type_poste | ENUM | NOT NULL | "bar" |
| dispo | BOOLEAN | DEFAULT TRUE | Disponible ou non |
| bestseller | BOOLEAN | DEFAULT FALSE | Produit vedette |
| photo | VARCHAR(255) | NULL | Chemin `/uploads/menu/fichier.jpg` |

#### commandes
| Colonne | Type | Contrainte | Usage |
|---------|------|------------|-------|
| id | INT | PK AUTO_INCREMENT | Numero de commande (CMD-XXX) |
| table_id | INT | FK → tables_salle.id (SET NULL) | Table associee |
| serveur_id | INT | FK → utilisateurs.id | Serveur qui a pris la commande |
| statut | ENUM | DEFAULT 'en attente' | `en attente`, `en preparation`, `servie`, `payee`, `annulee` |
| total | BIGINT | DEFAULT 0 | Total en F CFA |
| heure | TIME | NULL | Heure de creation |
| date | DATE | NULL | Date de creation |
| source | ENUM | DEFAULT 'staff' | `staff` ou `qr_client` |
| type_client | VARCHAR(60) | NULL | Type du client |
| note | TEXT | NULL | Note sur la commande |

#### commande_items
| Colonne | Type | Contrainte | Usage |
|---------|------|------------|-------|
| id | INT | PK AUTO_INCREMENT | Ligne de commande |
| commande_id | INT | FK → commandes.id (CASCADE) | Commande parente |
| produit_menu_id | INT | FK → produits_menu.id | Produit commande |
| quantite | INT | NOT NULL DEFAULT 1 | Quantite |
| prix_unitaire | BIGINT | NOT NULL | Prix au moment de la commande |
| type_poste | ENUM | NOT NULL | "bar" |
| statut | ENUM | DEFAULT 'en attente' | `en attente`, `en preparation`, `pret`, `servi`, `annule` |

### 2.3 Les 10 requetes SQL les plus utilisees

**1. Statistiques admin mensuelles (`statistiques.js`)**
```sql
SELECT
  COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) AS ca,
  COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0) AS depenses
FROM transactions
WHERE DATE_FORMAT(date, '%Y-%m') = ?
```
> Calcule le CA et les depenses du mois courant en sommant les entrees/sorties de la table `transactions`.

**2. Creation de commande (transactionnelle, `commandes.js`)**
```sql
INSERT INTO commandes (table_id, serveur_id, total, heure, date, source, note)
VALUES (?, ?, ?, CURTIME(), CURDATE(), ?, ?)
```
> Cree une commande avec l'heure/date actuelles. Fait partie d'une transaction incluant les items et le decrement du stock.

**3. Recuperer commandes en cours avec details (`commandes.js`)**
```sql
SELECT c.*, t.numero AS table_nom, u.prenom AS serveur,
       TIMESTAMPDIFF(MINUTE, c.heure, CURTIME()) AS temps
FROM commandes c
LEFT JOIN tables_salle t ON c.table_id = t.id
LEFT JOIN utilisateurs u ON c.serveur_id = u.id
WHERE c.statut IN ('en attente', 'en preparation', 'servie')
ORDER BY c.id DESC
```
> Recupere toutes les commandes non terminees avec le nom de table et du serveur, + le temps ecoule en minutes.

**4. Decrement stock par commande (`stock.js`)**
```sql
UPDATE produits_stock SET stock_actuel = stock_actuel - ? WHERE id = ?
```
> Decrement le stock d'un produit de matiere premiere quand une commande est passee. Appele une fois par ingredient de la recette.

**5. Ravitaillement complet (transaction, `stock.js`)**
```sql
-- Insere le ravitaillement
INSERT INTO ravitaillements (fournisseur_id, date, montant, nb_facture, photo_facture) VALUES (?, ?, ?, ?, ?)
-- Met a jour le stock
UPDATE produits_stock SET stock_actuel = stock_actuel + ?, dernier_ravitaillement = CURDATE(), alerte = FALSE WHERE id = ?
-- Trace le mouvement
INSERT INTO mouvements_stock (produit_stock_id, type, quantite, raison, reference_id) VALUES (?, 'entree', ?, 'Ravitaillement', ?)
```
> Tout est dans une transaction : cree le ravitaillement, augmente le stock, et trace le mouvement.

**6. Login utilisateur (`auth.js`)**
```sql
SELECT id, nom, prenom, email, mot_de_passe, role, poste, telephone,
       date_embauche, avatar, first_login
FROM utilisateurs
WHERE email = ? AND actif = TRUE
```
> Verifie l'email et que le compte est actif, puis compare le mot de passe.

**7. Produits du menu avec categorie (`menu.js`)**
```sql
SELECT p.*, c.nom AS categorie_nom, c.type_poste AS categorie_type
FROM produits_menu p
LEFT JOIN categories c ON p.categorie_id = c.id
ORDER BY c.ordre_affiche, p.nom
```
> Liste tous les produits avec leur categorie, tries par ordre d'affichage puis alphabetiquement.

**8. Paiement salaire (transaction, `personnel.js`)**
```sql
UPDATE salaires SET statut = 'paye', date_paiement = CURDATE() WHERE id = ?
INSERT INTO transactions (type_op, categorie, montant, reference, description, date)
VALUES ('sortie', 'Salaires', ?, ?, ?, CURDATE())
```
> Marque le salaire comme paye et cree une transaction de sortie automatique.

**9. Ventes par categorie de produits (`statistiques.js`)**
```sql
SELECT c.nom AS categorie, c.type_poste,
       COUNT(*) AS nb_ventes,
       SUM(ci.prix_unitaire * ci.quantite) AS total
FROM commande_items ci
JOIN produits_menu p ON ci.produit_menu_id = p.id
JOIN categories c ON p.categorie_id = c.id
JOIN commandes cmd ON ci.commande_id = cmd.id
WHERE cmd.date = ? AND ci.statut != 'annule'
GROUP BY c.nom, c.type_poste ORDER BY total DESC
```
> Aggrege le CA par categorie de produit pour une periode donnee.

**10. Alertes stock (`stock.js`)**
```sql
SELECT * FROM produits_stock WHERE stock_actuel < stock_min ORDER BY nom
```
> Retourne tous les produits dont le stock actuel est en dessous du minimum. Affiche un bandeau rouge dans l'admin.

### 2.4 Index

La BDD utilise principalement des index implicites (PK auto-increment). Les colonnes avec contraintes `UNIQUE` (`email`, `numero` de table, `nom` categorie/fournisseur) ont des index automatiques. Le code ne definit pas d'index supplementaires explicites. Pour ameliorer les performances sur de grosses donnees, il faudrait ajouter :
- `INDEX(date)` sur `commandes`, `transactions` (utilise dans tous les WHERE temporaires)
- `INDEX(statut)` sur `commandes` (filtre frequent)
- `INDEX(mois_annee)` sur `salaires` (jointure mensuelle)

### 2.5 Donnees de test

Le fichier `database.sql` contient des donnees de seed completes : 6 utilisateurs, 12 tables, 5 categories, 38 produits menu, 3 fournisseurs, 19 produits stock, 8 commandes avec items, 3 ravitaillements, 6 mouvements stock, 10 presences, 5 salaires, 5 impots, 12 transactions, 3 inventaires.

---

## 3. BACKEND — CHAQUE ROUTE DOCUMENTEE

### 3.1 Authentification (`/api/auth`)

| Methode | URL | Auth | Description |
|---------|-----|------|-------------|
| POST | `/api/auth/login` | Publique (rate limited: 5/15min) | Connexion email + mdp |
| POST | `/api/auth/register` | Admin | Creation compte utilisateur |
| PATCH | `/api/auth/change-password` | Auth (JWT) | Changement mot de passe |
| POST | `/api/auth/heartbeat` | Auth (JWT) | Mise a jour last_seen |

**POST /api/auth/login**
- Reçoit : `{ email: string, mot_de_passe: string }`
- Retourne : `{ success: true, user: {id,nom,prenom,email,role,poste,...}, token: string, first_login: boolean }`
- Logique :
  1. Valide le schema Zod (email valide + mdp non vide)
  2. Selectionne l'utilisateur par email + actif = TRUE
  3. Compare le mdp : si commence par `$2` → bcrypt.compare(), sinon egalite directe (fallback dev)
  4. Genere un JWT { id, role, email } avec 7 jours d'expiration
  5. Insere une presence du jour (`INSERT IGNORE`)
  6. Retourne user safe (sans mdp) + token
- Erreurs :
  - 400 : email/mdp manquant ou invalide
  - 401 : identifiants incorrects
  - 500 : erreur serveur

**POST /api/auth/register**
- Reçoit : `{ nom, prenom, email, mot_de_passe, role, poste?, telephone?, date_embauche?, salaire? }`
- Retourne : `{ success: true, id }`
- Logique :
  1. RequireRole("admin") → seul un admin peut creer des comptes
  2. Hash le mdp avec bcrypt(cost=10)
  3. Insert dans `utilisateurs` avec `first_login = TRUE`
  4. Si `salaire` fourni → insert dans `salaires` (mois courant)
  5. Insert dans `presences` (heure arrivee = now)
  6. Audit log
- Erreurs :
  - 400 : champs manquants, email deja utilise
  - 403 : pas admin
  - 500 : erreur serveur

**PATCH /api/auth/change-password**
- Reçoit : `{ ancien_mot_de_passe, nouveau_mot_de_passe }`
- Retourne : `{ success: true, message: "Mot de passe modiﬁe" }`
- Logique : authentification requise → verifie ancien mdp → hash nouveau → update + set first_login = FALSE → deconnexion forcee

### 3.2 Menu (`/api/menu`)

| Methode | URL | Auth | Description |
|---------|-----|------|-------------|
| GET | `/api/menu/categories` | Publique | Liste categories triees |
| GET | `/api/menu/produits` | Publique | Liste tous les produits avec categorie |
| GET | `/api/menu/produits/:id` | Publique | Detail d'un produit |
| POST | `/api/menu/produits` | **Admin** | Cree un produit (multipart OU JSON) |
| POST | `/api/menu/produits/:id/photo` | **Admin** | Upload photo pour un produit |
| DELETE | `/api/menu/produits/:id/photo` | **Admin** | Supprime la photo d'un produit |
| PATCH | `/api/menu/produits/:id/bestseller` | **Admin** | Toggle bestseller |
| PUT | `/api/menu/produits/:id/dispo` | **Admin** | Toggle disponibilite |
| PUT | `/api/menu/produits/:id` | **Admin** | Update complet d'un produit |
| DELETE | `/api/menu/produits/:id` | **Admin** | Supprime un produit |

**Note importante** : GET sur `/api/menu/produits` execute d'abord un `UPDATE produits_menu SET photo = NULL WHERE photo LIKE 'data:image%'` pour nettoyer les base64 stockes par erreur en base.

### 3.3 Tables (`/api/tables`)

| Methode | URL | Auth | Description |
|---------|-----|------|-------------|
| GET | `/api/tables` | Publique | Liste toutes les tables |
| POST | `/api/tables` | Staff+ | Cree une table |
| PUT | `/api/tables/:id` | Staff+ | Modifie une table (statut, places, zone, QR) |
| DELETE | `/api/tables/:id` | Staff+ | Supprime une table |

Roles autorises pour ecriture : `admin`, `serveur`, `caissier`, `barman`.

### 3.4 Commandes (`/api/commandes`)

| Methode | URL | Auth | Description |
|---------|-----|------|-------------|
| GET | `/api/commandes` | Publique (filtres: statut, date, table_id, source) | Liste commandes |
| GET | `/api/commandes/en-cours` | Publique | Commandes en attente/prep/servie |
| GET | `/api/commandes/items/bar` | Publique | Items bar en attente/prep/pret |
| POST | `/api/commandes` | Staff (source="staff") / Publique (source="qr_client") | Cree une commande |
| PATCH | `/api/commandes/:id/statut` | Staff+ | Change statut d'une commande |
| PATCH | `/api/commandes/items/:id/statut` | Staff+ | Change statut d'un item |
| PATCH | `/api/commandes/items/:id/pret` | Staff+ | Marque un item comme "pret" |
| POST | `/api/commandes/:id/payer` | Publique | Paiement d'une commande |
| POST | `/api/commandes/:id/payer/verify` | Publique | Verification paiement CamPay |
| GET | `/api/commandes/:id/recu` | Publique | Recu d'une commande |
| DELETE | `/api/commandes/:id` | Staff+ | Supprime une commande |
| GET | `/api/campay/balance` | Auth | Solde wallet CamPay |

**POST /api/commandes/:id/payer** — Paiement
- Reçoit : `{ mode_paiement, reference?, montant?, num_client?, campay_async? }`
- Modes : `especes`, `orange_money`, `mtn_momo`, `carte`, `transfert`
- Logique pour mobile money :
  1. Si `campay_async = true` → appelle CamPay API pour initier le paiement → insert dans `paiements` avec statut PENDING → retourne reference + USSD code
  2. Si synchrone → insert paiement → passe commande a `payee` → insere transaction `entree/Vente caisse` → libere la table
- Logique pour especes/carte/transfert → direct : insert paiement → commande `payee` → transaction → libere table
- Erreurs : 400 (mode invalide, numero manquant pour mobile), 404 (commande non trouvee), 502 (echec CamPay)

### 3.5 Stock (`/api/stock`) — Admin uniquement

| Methode | URL | Description |
|---------|-----|-------------|
| GET | `/api/stock` | Tous les produits stock |
| GET | `/api/stock/alertes` | Produits sous le stock min |
| PUT | `/api/stock/:id` | Modifie stock_actuel ou stock_min |
| POST | `/api/stock` | Ajoute un produit au stock |
| GET | `/api/stock/ravitaillements` | Historique ravitaillements avec details |
| POST | `/api/stock/ravitaillements` | Cree ravitaillement complet (transaction) |
| GET | `/api/stock/mouvements` | 100 derniers mouvements de stock |

**POST /api/stock/ravitaillements** (transaction)
- Reçoit : `{ fournisseur_id, date?, nb_facture?, photo_facture?, details: [{produit_stock_id, quantite, prix?}] }`
- Pour chaque detail : insert dans `ravitaillement_details` → `stock_actuel += quantite` → insert mouvement `entree`
- Calcul montant total = somme des `prix` de chaque detail
- Audit log + commit

### 3.6 Fournisseurs (`/api/fournisseurs`) — Admin uniquement

| Methode | URL | Description |
|---------|-----|-------------|
| GET | `/api/fournisseurs` | Liste + livraisons + totalAchats (optionnel: historique) |
| GET | `/api/fournisseurs/:id` | Detail + historique ravitaillements |
| POST | `/api/fournisseurs` | Cree fournisseur |
| PUT | `/api/fournisseurs/:id` | Modifie fournisseur |
| DELETE | `/api/fournisseurs/:id` | Supprime fournisseur |

### 3.7 Finances (`/api/finances`) — Admin uniquement

| Methode | URL | Description |
|---------|-----|-------------|
| GET | `/api/finances/transactions` | Transactions (filtres: type_op, date, mois) |
| GET | `/api/finances/bilan` | Bilan mensuel (CA, depenses, benefice, progression) |
| GET | `/api/finances/impots` | Liste impots |
| POST | `/api/finances/impots` | Ajoute impot |
| PATCH | `/api/finances/impots/:id/payer` | Marque impot paye + cree transaction sortie |
| POST | `/api/finances/transactions` | Cree transaction manuelle |

### 3.8 Statistiques (`/api/stats`) — Admin uniquement

| Methode | URL | Description |
|---------|-----|-------------|
| GET | `/api/stats/admin` | Stats mensuelles (CA, benefice, commandes, tables, depenses breakdown) |
| GET | `/api/stats/journalier` | Stats du jour (commandes, CA, panier moyen) |
| GET | `/api/stats/chiffre-affaires` | CA mensuel 12 derniers mois |
| GET | `/api/stats/commandes-par-heure` | Commandes groupees par heure |
| GET | `/api/stats/rapport` | Rapport detaille (period: journalier/mensuel/annuel) |

**GET `/api/stats/rapport`** — le plus complet
- Parametres query : `period` (journalier/mensuel/annuel), `date` (YYYY-MM-DD)
- Retourne : CA, depenses, benefice, nombreCommandes, panierMoyen, progressement vs periode precedente, paiementsParMode, ventesParCategorie, topProduits (10), commandesParHeure, listeCommandes

### 3.9 Personnel (`/api/personnel`)

| Methode | URL | Auth | Description |
|---------|-----|------|-------------|
| GET | `/api/personnel` | Staff+ | Liste personnel + salaire mois courant |
| PUT | `/api/personnel/:id` | Admin | Modifie employe |
| GET | `/api/personnel/presences` | Staff+ | Liste presences (filtre: date) |
| POST | `/api/personnel/presences` | Staff+ | Pointage (arrivee) |
| PATCH | `/api/personnel/presences/:id/depart` | Staff+ | Enregistrement depart |
| GET | `/api/personnel/salaires` | Admin | Salaires du mois (auto-generes si absents) |
| POST | `/api/personnel/salaires` | Admin | Cree un salaire |
| PATCH | `/api/personnel/salaires/:id` | Admin | Modifie montant salaire |
| PATCH | `/api/personnel/salaires/:id/payer` | Admin | Marque paye + cree transaction sortie |

### 3.10 Inventaire (`/api/inventaires`) — Admin uniquement

| Methode | URL | Description |
|---------|-----|-------------|
| GET | `/api/inventaires` | Liste inventaires avec produit + manageur |
| POST | `/api/inventaires` | Cree inventaire (calcule ecart = reel - theorique) |

### 3.11 Routes publiques speciales

| Methode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health` | Health check → `{ status: "ok", time: ... }` |
| GET | `/uploads/menu/:filename` | Servir les photos de produits (static) |

---

## 4. FRONTEND — CHAQUE COMPOSANT DISSEQUE

(Deja decrit en detail dans le tableau section 1.2. Resume des patterns communs :)

### 4.1 Pattern etat global (Zustand `appStore.js`)

Le store contient :
- `user` / `isAuthenticated` — authentification (persiste dans localStorage)
- `sidebarCollapsed` — etat sidebar
- **Donnees** : `tables`, `produits`, `commandesEnCours`, `statsMensuelles`, `revenusData`, `personnel`, `stockProduits`, `alertesStock`, etc.
- **Actions fetch** : `fetchTables()`, `fetchProduits()`, `fetchCommandesEnCours()`, `fetchStats()`, etc. — chaque action appelle l'API via `apiFetch()` et met a jour le state avec `set()`
- **Mutations** : `addCommande()`, `updateProduit()`, `payerCommande()`, etc. — envoient des requetes puis refetchent les donnees

### 4.2 Pattern de composant typique

```jsx
const data = useAppStore(s => s.data)   // lire
const fetchData = useAppStore(s => s.fetchData)  // action

useEffect(() => { fetchData() }, [fetchData])  // mount

// UI avec data, boutons appellent des mutations du store
```

### 4.3 Gestion des erreurs

- En cas de 401 API : le token est supprime + redirection vers `/login`
- Les composants n'affichent pas de messages d'erreur inline ; le `console.error` est utilise cote store
- `ClientQR.jsx` est le seul a afficher des erreurs UI (etat `error` + bouton "Reessayer")

---

## 5. FLUX MÉTIER COMPLETS

### 5.1 Un client commande via QR code

```
Client scan QR table T5
  → GET /qr/5
    → ClientQR.jsx monte
    → GET /api/menu/produits (publique)
    → menu s'affiche (seuls les produits dispo=true)

Client ajoute Mojito×2 + Mutzig×1 au panier
  → Etat local React (cart state)

Client clique "Commander"
  → POST /api/commandes
     Body: { table_id, items: [{produit_menu_id, quantite, prix_unitaire, type_poste}], source: "qr_client" }
    → Backend : validation → insert commande + items
    → Service stock : verifierStockSuffisant() → decrementerStockCommande()
    → Update table : SET statut='occupee' WHERE id=5
    → Retourne { success: true, commandesId }

Client voit ecran de suivi : Envoyee → En preparation → Pret
  → Timer simulé côté client (setTimeout, pas de polling réel)

Serveur voit la commande dans StaffCommandes.jsx
  → Passe "en attente" → "en preparation" → "servie"
    → PATCH /api/commandes/:id/statut
```

### 5.2 Prise de commande par le serveur

```
StaffCommandes.jsx → clique "Nouvelle commande"
  → Selection table (boutons)
  → Selection produits (grid avec recherche + filtres par categorie)
  → Panier interne (cartItems state)
  → "Valider la commande"
    → addCommande() → POST /api/commandes
       Body: { table_id, items: [...], source: "staff" }
    → Commande apparaît dans la liste avec statut "en attente"
```

### 5.3 Paiement d'une commande

```
StaffCommandes.jsx → clique "Paiement" sur commande en statut "servie"
  → Modal paiement : choix mode (especes/OM/MoMo/carte/transfert)
  → Si mobile money : numero client obligatoire
  → confirmPayment() → payerCommande() → POST /api/commandes/:id/payer
    → Paiement enregistre dans table `paiements`
    → Commande passe a statut "payee"
    → Transaction `entree/Vente caisse` creee
    → Table repasse a `libre`
    → Toast "Paiement confirme"
```

### 5.4 Ajout d'un plat au menu (admin)

```
MenuAdmin.jsx → clique "Ajouter produit"
  → Modal ProductForm → rempli nom, prix, categorie, desc, photo
  → onSave → createProduit()
     → Si photo = File : FormData multipart → POST /api/menu/produits
     → Sinon : JSON → POST /api/menu/produits
    → Backend : validation → insert produit_menu
    → fetchProduits() re-chargement
    → Produit apparaіt dans la grid
```

### 5.5 Ravitaillement (reapprovisionnement stock)

```
Stock.jsx → tab "Stock" → bouton "Nouveau ravitaillement"
  → Modal : selection fournisseur + liste produits/quantites
  → Valider → createRavitaillement() → POST /api/stock/ravitaillements
    → Backend (transaction) :
       1. Insert ravitaillement
       2. Pour chaque detail : stock_actuel += quantite
       3. Insert mouvement_stock 'entree'
       4. alerte = FALSE
    → fetchRavitaillements() + fetchStock() + fetchAlertesStock()
    → Stock mis a jour + alerte disparait
```

---

## 6. AUTHENTIFICATION & RÔLES

### 6.1 Mecanisme

- **JWT** (jsonwebtoken) — tokens signes avec `process.env.JWT_SECRET`
- Expiration : 7 jours
- Payload : `{ id, role, email }`
- Stocke dans `localStorage.getItem("token")` cote frontend
- Header `Authorization: Bearer <token>` a chaque requete

### 6.2 Roles

| Role | Description | Pages accessibles |
|------|-------------|-------------------|
| `admin` | Super-utilisateur | `/admin/*` (dashboard, finances, rapports, personnel, stock, menu, QR) |
| `serveur` | Serveur en salle | `/staff/*` (dashboard, tables, commandes, bar) |
| `caissier` | Caissiere | `/staff/*` (meme acces que serveur) |
| `barman` | Barman | `/staff/*` (meme acces que serveur) |

### 6.3 Verification cote backend (`middleware/auth.js`)

```
requireRole("admin")              → exige role = admin
requireRole(["admin","serveur"])  → exige un des roles
```

- Si pas de header Authorization → 401
- Si token invalide/expiré → 401
- Si role non autorise → 403

### 6.4 Verification cote frontend (`App.jsx`)

```jsx
<RequireAuth role="admin">      → verifie user.role === "admin"
<RequireAuth>                   → verifie juste user != null
```

### 6.5 Exceptions (routes publiques cote API)

| Route | Methodes publiques | Methodes restreintes |
|-------|-------------------|---------------------|
| `/api/menu` | GET | POST, PUT, PATCH, DELETE → admin |
| `/api/commandes` | GET, POST | PATCH, DELETE → staff+ |
| `/api/tables` | GET | POST, PUT, DELETE → staff+ |
| `/api/auth/heartbeat` | POST (mais requiert JWT pour update last_specifique) | |

---

## 7. VARIABLES D'ENVIRONNEMENT & CONFIG

### 7.1 Backend (.env)

| Variable | Usage | Fichier(s) | Exemple |
|----------|-------|-----------|---------|
| `DB_HOST` | Hote MySQL | `config/db.js` | `localhost` |
| `DB_USER` | Utilisateur MySQL | `config/db.js` | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | `config/db.js` | `votre_mot_de_passe` |
| `DB_NAME` | Nom de la database | `config/db.js`, `server.js` | `barresto_db` |
| `PORT` | Port ecoute | `server.js` | `3000` |
| `JWT_SECRET` | Cle de signature JWT | `middleware/auth.js`, `routes/auth.js` | `min_64_caracteres_...` |
| `ALLOWED_ORIGINS` | Origins CORS (comma-separated) | `server.js` | `http://localhost:5173,http://localhost:3000` |
| `CAMPAY_ENV` | Environnement paiement | `services/campay.js` | `sandbox` ou `production` |
| `CAMPAY_USERNAME` | Username API CamPay | `services/campay.js` | `votre_username` |
| `CAMPAY_PASSWORD` | Password API CamPay | `services/campay.js` | `votre_password` |
| `NODE_ENV` | Mode (production = logs fichier) | `config/logger.js` | `development` ou `production` |
| `LOG_LEVEL` | Niveau de log Winston | `config/logger.js` | `info` |

### 7.2 Frontend (.env ou VITE_API_URL)

| Variable | Usage | Fichier(s) | Exemple |
|----------|-------|-----------|---------|
| `VITE_API_URL` | URL base API | `appStore.js`, `ClientQR.jsx`, `Login.jsx`, etc. | `http://localhost:3000/api` |

Si non defini, fallback : `http://${window.location.hostname}:3000/api`

### 7.3 Base de donnees

- MySQL/MariaDB sur `localhost:3306`
- Pool : 10 connexions max, `waitForConnections: true`
- Database : `barresto_db`
- Charset : `utf8mb4`

### 7.4 Cle API externe

- **CamPay** (`campay.net`) — paiement mobile au Cameroun. Compte sandbox sur `demo.campay.net`. Utilise pour Orange Money et MTN MoMo.

---

## 8. GUIDE "REFAIRE FROM SCRATCH"

### 8.1 Pre-requis

- Node.js >= 18
- MySQL/MariaDB >= 8
- npm ou pnpm

### 8.2 Etapes

```bash
# 1. Creer les dossiers
mkdir bar-restaurant && cd bar-restaurant
mkdir backend frontend

# 2. Backend
cd backend
npm init -y
npm install express@^5.2.1 mysql2@^3.20.0 cors@^2.8.6 dotenv@^17.4.0 \
  express-rate-limit@^8.3.2 helmet@^8.1.0 jsonwebtoken@^9.0.3 bcryptjs@^3.0.3 \
  multer@^2.1.1 winston@^3.19.0 winston-daily-rotate-file@^5.0.0 zod@^4.3.6 \
  uuid@^13.0.0 axios@^1.8.0

npm install -D jest@^30.3.0 supertest@^7.2.2

# .env
cp .env.example .env
# Editer .env avec vos valeurs

# 3. Base de donnees
mysql -u root -p < database.sql

# 4. Frontend
cd ../frontend
npm init -y
npm install react@^19.2.4 react-dom@^19.2.4 react-router-dom@^7.14.0 \
  zustand@^5.0.12 framer-motion@^12.38.0 lucide-react@^1.7.0 \
  axios@^1.14.0 recharts@^3.8.1 qrcode.react@^4.2.0 \
  clsx@^2.1.1 tailwind-merge@^3.5.0

npm install -D vite@^8.0.1 @vitejs/plugin-react@^6.0.1 \
  tailwindcss@^4.2.2 @tailwindcss/vite@^4.2.2 \
  eslint@^9.39.4 prettier@^3.8.1 \
  @types/react@^19.2.14 @types/react-dom@^19.2.3 @types/node@^25.5.2 \
  eslint-plugin-react-hooks@^7.0.1 eslint-plugin-react-refresh@^0.5.2 \
  globals@^17.4.0 prettier-plugin-tailwindcss@^0.7.2

# 5. Configurer Tailwind dans index.css
# Ajouter @import "tailwindcss";

# 6. Lancer en developpement
# Terminal 1 — Backend
cd backend
npm start

# Terminal 2 — Frontend
cd frontend
npx vite
```

### 8.3 Build production

```bash
cd frontend
npx vite build
# Sortie dans dist/

cd backend
# Pas de build — c'est du Node.js natif
# Servir le dist/ frontend avec un reverse proxy (Nginx)
```

### 8.4 Deploiement (Nginx + PM2)

```bash
# 1. Installer PM2
npm install -g pm2

# 2. Lancer le backend
cd backend
pm2 start server.js --name bar-api --env production

# 3. Nginx config
server {
    listen 80;
    server_name barresto.cm;

    # Frontend build
    location / {
        root /var/www/bar-restaurant/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}

# 4. PM2 startup
pm2 save
pm2 startup
```

---

## 9. GUIDE DE MAINTENANCE QUOTIDIENNE

### 9.1 Ajouter un nouveau plat/boisson

**Via l'interface** (recommande) :
1. Se connecter en admin → `/admin/menu`
2. Cliquer "Ajouter produit"
3. Remplir : nom, prix (F CFA), categorie, description
4. Optionnel : photo, bestseller
5. Sauvegarder

**Via SQL** :
```sql
-- Trouver l'ID de la categorie
SELECT id FROM categories WHERE nom = 'Cocktails';
-- Supposons id = 1

INSERT INTO produits_menu (categorie_id, nom, description, prix, type_poste, dispo, bestseller)
VALUES (1, 'Moscow Mule', 'Vodka, ginger beer, citron vert', 2500, 'bar', TRUE, FALSE);
```

### 9.2 Modifier le prix d'un article

**Via l'interface** :
1. `/admin/menu` → clic sur crayon du produit → modifier le prix
2. Ou clic sur le toggle bestseller/dispo directement sur la carte

**Via SQL** :
```sql
UPDATE produits_menu SET prix = 3500 WHERE nom = 'Mojito Camer';
```

### 9.3 Ajouter une nouvelle table

**Via l'interface** :
1. `/staff/tables` ou `/admin/menu` (non, c'est tables) → clique "Ajouter table"
2. Numero, places, zone → sauvegarder
3. Pour le QR : `/admin/qrcodes`

**Via SQL** :
```sql
INSERT INTO tables_salle (numero, places, zone, statut, qr_actif)
VALUES ('T13', 4, 'Terrasse', 'libre', TRUE);
```

### 9.4 Creer un nouveau compte utilisateur

**Via l'interface** :
1. Se connecter en admin → `/admin/personnel` → "Ajouter employe"
2. Remplir : nom, prenom, poste, email, telephone, mot de passe, salaire
3. Sauvegarder

**Via API** (admin seulement) :
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Jean","email":"jean@bar.cm","mot_de_passe":"temp123!","role":"serveur","poste":"Serveur"}'
```

**Via SQL** (avec hash bcrypt) :
```sql
-- Generer le hash avec bcrypt (cost 10, ne JAMAIS stocker en clair)
-- Utiliser le script : node scripts/hash-passwords.js
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, first_login)
VALUES ('Dupont', 'Jean', 'jean@bar.cm', '$2a$10$...', 'serveur', 'Serveur', 1);
```

### 9.5 Consulter l'historique des ventes

1. Se connecter en admin
2. `/admin/finances` → "Historique des Transactions" (filtres: Tout/Entrees/Sorties)
3. `/admin/rapports` → choisir periode (journalier/mensuel/annuel) → liste commandes + graphiques
4. Export CSV depuis la page Rapports

**Via SQL** :
```sql
-- Ventes du jour
SELECT c.id, t.numero, u.prenom, c.heure, c.statut, c.mode_paiement, c.total
FROM commandes c
LEFT JOIN tables_salle t ON c.table_id = t.id
LEFT JOIN utilisateurs u ON c.serveur_id = u.id
WHERE c.date = CURDATE()
ORDER BY c.id DESC;

-- CA du mois
SELECT SUM(CASE WHEN type_op='entree' THEN montant ELSE 0 END) AS ca
FROM transactions
WHERE DATE_FORMAT(date,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m');
```

### 9.6 Sauvegarder la base de donnees

**Script inclus** :
```bash
cd backend
npm run backup      # Sauvegarde
npm run restore     # Restauration
```

**Manuellement** :
```bash
mysqldump -u root -p barresto_db > barresto_backup_$(date +%Y%m%d).sql
# Restauration :
mysql -u root -p barresto_db < barresto_backup_20260406.sql
```

---

## 10. DÉPENDANCES — CHAQUE PACKAGE EXPLIQUÉ

### 10.1 Backend

| Package | Version | Pourquoi | Fichiers | Si supprime |
|---------|---------|----------|----------|-------------|
| `express` | ^5.2.1 | Framework HTTP | `server.js`, toutes les routes | Plus rien ne tourne |
| `mysql2` | ^3.20.0 | Driver MySQL avec Promise | `config/db.js`, toutes les routes | Aucune requete DB possible |
| `cors` | ^2.8.6 | Autoriser requetes frontend | `server.js` | Le frontend serait bloque par CORS |
| `dotenv` | ^17.4.0 | Charger .env dans process.env | `server.js`, `config/db.js` | Variables d'env non chargees → crash |
| `express-rate-limit` | ^8.3.2 | Protection brute-force login | `server.js` | Pas de limite de tentatives login |
| `helmet` | ^8.1.0 | Headers de securite HTTP | `server.js` | Moins de protection XSS/injection |
| `jsonwebtoken` | ^9.0.3 | Generation/verification JWT | `middleware/auth.js`, `routes/auth.js` | Plus d'authentification |
| `bcryptjs` | ^3.0.3 | Hash mots de passe | `routes/auth.js` | Mdp stockes en clair |
| `multer` | ^2.1.1 | Upload fichiers (photos) | `middleware/upload.js`, `routes/menu.js` | Plus de photo upload |
| `winston` | ^3.19.0 | Logger structure | `config/logger.js` | Plus de logs |
| `winston-daily-rotate-file` | ^5.0.0 | Rotation logs par jour | `config/logger.js` | Logs non rotatifs |
| `zod` | ^4.3.6 | Validation schemas | Toutes les routes (middleware/validate.js) | Plus de validation des donnees |
| `uuid` | ^13.0.0 | Generation ID requete unique | `middleware/requestLogger.js` | Pas d'ID de traçabilite |
| `axios` | ^1.8.0 | Client HTTP (CamPay API) | `services/campay.js` | Plus de paiement mobile |
| `jest` (dev) | ^30.3.0 | Tests unitaires | `tests/` | Plus de tests |
| `supertest` (dev) | ^7.2.2 | Tests HTTP | `tests/` | Plus de tests integration |

### 10.2 Frontend

| Package | Version | Pourquoi | Fichiers | Si supprime |
|---------|---------|----------|----------|-------------|
| `react` | ^19.2.4 | Framework UI | Tout | Application detruite |
| `react-dom` | ^19.2.4 | Rendu DOM | `main.jsx` | Plus de rendu |
| `react-router-dom` | ^7.14.0 | Routing SPA | `App.jsx`, layouts pages | Plus de navigation |
| `zustand` | ^5.0.12 | State management | `appStore.js`, tous les composants | Plus de gestion d'etat |
| `framer-motion` | ^12.38.0 | Animations | Tous les composants UI | Plus d'animations |
| `lucide-react` | ^1.7.0 | Icones | Tous les composants | Plus d'icones (erreurs d'import) |
| `axios` | ^1.14.0 | Client HTTP (import dans appStore, mais utilise `fetch` natif) | `api.js` (import) | Impact mineur (non utilise) |
| `recharts` | ^3.8.1 | Graphiques | `AdminDashboard.jsx`, `Finances.jsx`, `Rapports.jsx` | Plus de graphiques |
| `qrcode.react` | ^4.2.0 | Generation QR | `QRCodes.jsx` | Plus de QR codes |
| `clsx` | ^2.1.1 | Classes conditionnelles | `lib/utils.js`, `badge.jsx`, `statCard.jsx` | Erreur d'import |
| `tailwind-merge` | ^3.5.0 | Merge classes Tailwind | `lib/utils.js` | Conflits de classes CSS |
| `vite` (dev) | ^8.0.1 | Bundler/frontend server | `vite.config.js` | Plus de dev server |
| `@vitejs/plugin-react` (dev) | ^6.0.1 | Plugin React pour Vite | `vite.config.js` | JSX non compiles |
| `tailwindcss` (dev) | ^4.2.2 | Framework CSS | `index.css`, tous les JSX | Plus de styles |
| `@tailwindcss/vite` (dev) | ^4.2.2 | Integration Tailwind/Vite | `vite.config.js` | Tailwind non active |
| `eslint` (dev) | ^9.39.4 | Linter | `eslint.config.js` | Plus de lint |
| `prettier` (dev) | ^3.8.1 | Formateur | — | Code pas format automatiquement |
| `globals` (dev) | ^17.4.0 | Globals ESLint | Config ESLint | Warning ESLint |
| `prettier-plugin-tailwindcss` (dev) | ^0.7.2 | Tri automatique classes Tailwind | — | Classes pas triees |

---

## ANNEXE — NOTES IMPORTANTES

### A. Points de vigilance

1. **Mot de passe en clair** : Les donnees de seed dans `database.sql` ont des mdp en clair (`admin123`, `staff123`). Le code a un fallback pour les comparer. En production : `node scripts/hash-passwords.js` puis relancer le serveur.

2. **`type_poste = 'bar'` uniquement** : Le DB schema et le code ne supportent que `bar`. Les donnees mock (`mockData.js`) mentionnent `cuisine` mais ce n'est pas fonctionnel en production.

3. **Pas de polling temps reel** : Les commandes ne sont pas mises a jour en temps reel (pas de WebSocket, pas de Server-Sent Events). Il faut refresh la page pour voir de nouvelles commandes. Le `heartbeat` toutes les 10s ne met a jour que `last_seen`.

4. **Decrement stock incomplet** : Le mapping `RECETTE_INGREDIENTS` dans `services/stock.js` ne couvre que les produits 1-6. Les 32 autres produits du menu ne decremenent pas le stock.

5. **Table `paiements` manquante** : Le code dans `commandes.js` fait des INSERT/SELECT sur la table `paiements`, mais elle n'est pas dans `database.sql`. Il manque `scripts/add-payment.sql` a executer.

6. **Mode paiement non stocke** : La colonne `mode_paiement` sur `commandes` n'existe pas dans le schema initial. Le code l'utilise — il manque `scripts/add-payment.sql`.

7. **Deux versions de `apiFetch`** : `src/api.js` et `src/store/appStore.js` ont chacun leur implementation. Seul `appStore.js` est utilise. Le fichier `api.js` est orphelin.

8. **Composants non utilises** : `AdminPlaceholders.jsx`, `StaffPlaceholders.jsx`, `button.jsx`, `card.jsx` ne sont importes nulle part.

### B. Comptes de test par defaut

| Email | Mdp | Role |
|-------|-----|------|
| `admin@barresto.cm` | `admin123` | Admin |
| `aminata@barresto.cm` | `staff123` | Serveur |
| `moussa@barresto.cm` | `staff123` | Serveur |
| `fatou@barresto.cm` | `staff123` | Caissier |
| `oumar@barresto.cm` | `staff123` | Barman |
| `aissata@barresto.cm` | `staff123` | Serveur |

### C. Zones et tables configurees

- **Salle principale** : T1, T2, T3, T4 (4 tables)
- **Terrasse** : T5, T6, T7 (3 tables)
- **VIP** : T8, T9 (2 tables)
- **Bar** : Bar1, Bar2 (2 tables, QR inactif)
- **Prive** : T12 (1 table)

Total : 12 tables, 52 places
