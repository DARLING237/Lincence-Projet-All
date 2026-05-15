# Guide Debutant — Bar-Restaurant (De Zero a Prod)

> **Mentalite :** Tu n'as pas besoin d'etre intelligent pour coder. Tu as besoin d'etre **curieux** et **patient**.
> Je vais t'expliquer chaque concept comme si on etait assis ensemble et que je te montrais sur mon ecran.

---

## Table des matieres

```
PARTIE 0  →  L'etat d'esprit avant de commencer
PARTIE 1  →  Ce qu'est un site web (vraiment)
PARTIE 2  →  Les outils a installer (pas a pas)
PARTIE 3  →  Le plan du projet (architecture)
PARTIE 4  →  La base de donnees (la memoire)
PARTIE 5  →  Le backend (le cerveau) — ETAPE PAR ETAPE
PARTIE 6  →  Le frontend (l'ecran) — ETAPE PAR ETAPE
PARTIE 7  →  Comment tout se connecte (un flux complet)
PARTIE 8  →  Lancer le projet (checklist infaillible)
PARTIE 9  →  Bugs courants + solutions exactes
PARTIE 10 →  Comment ajouter une fonctionnalite (methode)
PARTIE 11 →  Lexique (les mots que tu vas entendre)
PARTIE 12 →  Checklist de reproduction (plan de bataille)
```

---

## PARTIE 0 — L'etat d'esprit

### La regle d'or

**Ne lis jamais tout ce guide d'un coup.** Lis une partie, comprends-la, puis passe a la suivante. Si un concept n'est pas clair, relis-le. Ce n'est pas un concours de vitesse.

### Comment penser comme un developpeur

Un developpeur ne "sait" pas coder de tete. Un developpeur **sait decomposer un probleme** en morceaux si petits que chaque morceau devient facile a resoudre.

```
Probleme : "Je veux un systeme de gestion de restaurant"
  → C'est trop gros. Decoupe-le :

    1. Je veux que quelqu'un puisse se connecter
    2. Je veux voir les tables
    3. Je veux creer une commande
    4. Je veux modifier le statut d'une commande
    5. Je veux encaisser un paiement
    6. Je veux voir mes stats

Chaque point = un mini-projet de 1-2 jours.
```

### Les 3 questions que tu dois toujours te poser

1. **Qu'est-ce que je veux faire ?** (creer un utilisateur, afficher des tables...)
2. **Ou est-ce que je le fais ?** (dans la DB, dans le backend, dans le frontend ?)
3. **Comment est-ce que je teste que ca marche ?** (je lance, je clique, je regarde la console)

---

## PARTIE 1 — Ce qu'est un site web (vraiment)

### Le modele client-serveur (l'analogie du restaurant)

```
Toi au restaurant :                              Site web
━━━━━━━━━━━━━━━━────────────────────────────────────────────────
1. Tu regardes le menu sur la table       →      Tu ouvres la page /login
2. Tu appelles le serveur et commandes    →      Tu cliques "Connexion"
3. Le serveur va en cuisine verifier      →      Le frontend envoie une requete
                                                  au backend via HTTP
4. La cuisine prepare et renvoie le plat  →      Le backend verifie dans la DB,
                                                  calcule, et renvoie une reponse
5. Le serveur te ramene le plat           →      Le frontend affiche le resultat
```

**La difference cle :** Dans un restaurant reel, le serveur est une personne. Sur le web, le "serveur" est un **programme qui tourne en permanence** sur un ordinateur et qui repond aux messages.

### Les 3 couches de NOTRE application

Notre projet a **3 parties distinctes** qui tournent sur ton PC :

```
┌─────────────────────────────────────────────────┐
│ FRONTEND (React + Vite + Tailwind CSS)          │
│ C'est CE QUE TU VOIS dans le navigateur         │
│ Il tourne sur http://localhost:5173              │
│ Il est fait de composants (briques) React        │
│ Il ne parle JAMAIS directement a MySQL           │
└─────────────────┬───────────────────────────────┘
                  │
                  │  Envoie des "requetes HTTP" (GET, POST, PATCH...)
                  │  Body = JSON { "email": "...", "mot_de_passe": "..." }
                  ▼
┌─────────────────────────────────────────────────┐
│ BACKEND (Express.js / Node.js)                   │
│ C'est LE CERVEAU qui reflechit                   │
│ Il tourne sur http://localhost:3000              │
│ Il rec:oit les requetes, verifie, calcule,       │
│  parle a la base de donnees, renvoie la reponse  │
│ Il a des middleware (filtres), des routes,       │
│  des services (logique metier)                   │
└─────────────────┬───────────────────────────────┘
                  │
                  │  Envoie des requetes SQL (SELECT, INSERT, UPDATE...)
                  ▼
┌─────────────────────────────────────────────────┐
│ BASE DE DONNEES (MySQL via WAMP)                 │
│ C'est LA MEMOIRE de l'application                │
│ Tourne sur localhost:3306                        │
│ Stocke tout TOUT dans des tables (comme Excel)   │
│ 16 tables pour ce projet                         │
└─────────────────────────────────────────────────┘
```

### Les technos utilisees (et POURQUOI celles-ci)

| Couche | Techno | Pourquoi celle-ci ? |
|--------|--------|---------------------|
| Frontend | **React** | Plus populaire, enorme communaute, composants reutilisables |
| Frontend | **Vite** | Plus rapide que l'ancien Create-React-App |
| Frontend | **Tailwind CSS** | Pas besoin d'ecrire des fichiers CSS separes |
| Frontend | **Zustand** | Plus simple que Redux pour l'etat global |
| Frontend | **React Router** | Change de page sans recharger le navigateur |
| Backend | **Express.js** | Framework Node.js le plus populaire, simple |
| Backend | **mysql2** | Driver officiel pour parler a MySQL |
| Backend | **bcrypt** | Secure les mots de passe (hash, pas texte) |
| Backend | **jsonwebtoken** | Cree des tokens d'authentification |
| Backend | **helmet** | Ajoute des en-tetes de securite HTTP |
| Backend | **express-rate-limit** | Empeche le spam de requetes |
| Backend | **multer** | Gere l'upload de fichiers (images menu) |
| DB | **MySQL** | Gratuit, fiable, puissant pour les donnees relationnelles |

---

## PARTIE 2 — Les outils a installer (pas a pas)

### Check-list de pre-requis

Pour chaque outil, je te dis **comment verifier** si tu l'as deja.

#### 1. Node.js (le moteur qui fait tourner JavaScript hors du navigateur)

```bash
node --version
```
Si tu vois `v20.x.x` ou `v18.x.x`, c'est bon. Sinon → https://nodejs.org/ (prends la version LTS)

```bash
npm --version
```
Doit afficher `9.x.x` ou plus. `npm` est le gestionnaire de paquets installe avec Node.

#### 2. WAMP (MySQL + phpMyAdmin sur Windows)

Regarde la barre des taches Windows (en bas a droite). Tu vois une icone **W** verte ? C'est bon.

Sinon → https://www.wampserver.com/
- Installe avec les parametres par defaut
- Attends que l'icone soit VERTE (c'est important — jaune = pas pret)
- Teste : ouvre `http://localhost/phpmyadmin` dans ton navigateur

#### 3. VS Code (ton editeur de code)

https://code.visualstudio.com/

**Extensions a installer** (dans VS Code : Extensions → cherche le nom → Install) :
- `ES7+ React/Redux/React-Native snippets` — autocomplete React
- `Tailwind CSS IntelliSense` — suggestions CSS
- `Error Lens` — erreurs en rouge directement dans le code

#### 4. Git Bash (terminal plus puissant que CMD sur Windows)

https://git-scm.com/download/win

Installe-le. Toutes les commandes de ce guide sont testees sur **Git Bash**.

#### 5. Un navigateur moderne (Chrome, Firefox, Edge)

N'importe quel navigateur recent va. Ouvre les **outils de developpeur** avec `F12` et va dans l'onglet **Console** (pour les erreurs JavaScript) et **Network** (pour voir les requetes HTTP).

---

## PARTIE 3 — Le plan du projet (architecture)

### Structure complete des fichiers

```
bar-restaurant/
│
├── backend/                          ← LE CERVEAU
│   ├── server.js                     ← POINT D'ENTREE. Le fichier qui lance tout
│   ├── .env                          ← Secrets (mots de passe DB, JWT_SECRET)
│   ├── package.json                  ← Dependances du backend
│   ├── database.sql                  ← Schema + donnees de test
│   │
│   ├── config/
│   │   ├── db.js                     ← Configuration MySQL (pool de connexions)
│   │   └── logger.js                 ← Winston logger (logs formattes)
│   │
│   ├── middleware/                   ← FILTRES (tournent AVANT les routes)
│   │   ├── auth.js                   ← Verifie le token JWT et le role
│   │   ├── requestLogger.js          ← Log chaque requete (methode, URL, temps)
│   │   ├── connectionTracker.js      ← Suit les connexions/deconnexions
│   │   ├── auditLogger.js            ← Journal d'audit (qui a fait quoi)
│   │   ├── upload.js                 ← Multer config (upload images menu)
│   │   └── validate.js               ← Validation des donnees recues
│   │
│   ├── routes/                       ← LES ROUTES (URL → action)
│   │   ├── auth.js                   ← /api/auth/login, /api/auth/register, etc.
│   │   ├── tables.js                 ← /api/tables (CRUD des tables)
│   │   ├── menu.js                   ← /api/menu (CRUD des produits/categorie)
│   │   ├── commandes.js              ← /api/commandes (+ QR, paiement, transfert)
│   │   ├── stock.js                  ← /api/stock (mouvements, alertes)
│   │   ├── fournisseurs.js           ← /api/fournisseurs (CRUD)
│   │   ├── finances.js               ← /api/finances (transactions, salaires, impots)
│   │   ├── statistiques.js           ← /api/stats (graphiques, KPI)
│   │   ├── personnel.js              ← /api/personnel (employes, presences)
│   │   ├── inventaire.js             ← /api/inventaires (stock physique)
│   │   ├── connectionHistory.js      ← /api/connection-history (qui s'est connecte)
│   │   └── uploads.js                ← Upload de fichiers
│   │
│   ├── services/                     ← LOGIQUE METIER (fonctions complexes)
│   │   ├── campay.js                 ← Integration paiement mobile (Campay)
│   │   └── stock.js                  ← Logique de calcul de stock
│   │
│   ├── scripts/                      ← Scripts utilitaires (nettoyage, seeds...)
│   │
│   ├── middleware/
│   │   └── upload.js                 ← Config multer pour images menu
│   │
│   ├── uploads/                      ← Images uploadées (menu)
│   │
│   └── logs/                         ← Fichiers de logs (Winston)
│
├── frontend/                         ← L'ECRAN
│   ├── package.json                  ← Dependances du frontend
│   ├── vite.config.js                ← Config Vite (proxy vers backend)
│   ├── index.html                    ← Page HTML unique (SPA)
│   └── src/
│       ├── main.jsx                  ← POINT D'ENTREE. Monte <App /> dans #root
│       ├── App.jsx                   ← LE GPS. Routes et guards
│       ├── api.js                    ← La fonction fetch commune (+ token)
│       │
│       ├── store/
│       │   └── appStore.js           ← MAGASIN ZUSTAND. Donnees + actions globales
│       │
│       ├── pages/                    ← ECRANS COMPLETS
│       │   ├── Login.jsx             ← Page de connexion
│       │   ├── ChangePassword.jsx    ← Changement de mot de passe (first login)
│       │   ├── AdminDashboard.jsx    ← Dashboard admin (KPI, stats rapides)
│       │   ├── Finances.jsx          ← Gestion financiere (transactions, benefices)
│       │   ├── Rapports.jsx          ← Rapports et exports
│       │   ├── Personnel.jsx         ← Gestion employes (listes, salaires, presences)
│       │   ├── Stock.jsx             ← Gestion stock (alertes, mouvements)
│       │   ├── MenuAdmin.jsx         ← Admin menu (creer/editer produits)
│       │   ├── QRCodes.jsx           ← Generation QR codes pour tables
│       │   ├── ConnectionHistory.jsx ← Historique des connexions
│       │   ├── StaffDashboard.jsx    ← Dashboard serveur
│       │   ├── StaffTables.jsx       ← Gestion des tables (grille visuelle)
│       │   ├── StaffCommandes.jsx    ← Commandes (creer, transferer, payer)
│       │   ├── StaffBar.jsx          ← Cote barman (commandes boissons)
│       │   ├── ClientQR.jsx          ← Page client (scan QR table → commande)
│       │   └── AdminPlaceholders.jsx ← (pages admin secondaires)
│       │   └── StaffPlaceholders.jsx ← (pages staff secondaires)
│       │
│       ├── components/               ← BRIQUES REUTILISABLES
│       │   ├── layout/
│       │   │   ├── AdminLayout.jsx   ← Sidebar + header pour admin
│       │   │   └── StaffLayout.jsx   ← Sidebar + header pour staff
│       │   └── ui/
│       │       ├── button.jsx        ← Bouton stylise
│       │       ├── badge.jsx         ← Badge coloré (statut)
│       │       ├── card.jsx          ← Carte conteneur
│       │       ├── statCard.jsx      ← Carte avec chiffre + icone
│       │       └── ConnectionAlert.jsx ← Alerte si backend pas joignable
│       │
│       └── data/
│           └── mockData.js           ← Donnees de test (si API pas dispo)
│
├── docs/                             ← Documentation technique
├── ux/                               ← UX/UI assets (maquettes)
├── cli/                              ← Scripts CLI utilitaires
├── image/                            ← Images de reference
├── DOCUMENTATION.md                  ← Documentation complete
├── GUIDE_DEBUTANT_COMPLET.md         ← CE FICHIER
└── BarResto_Cahier_Des_Charges.docx  ← Le cahier des charges initial
```

### Les roles utilisateur

Notre app a **3 types d'utilisateurs** et chaque type voit des choses differentes :

| Role | Ce qu'il voit | URL principale |
|------|---------------|----------------|
| `admin` | Tout (stats, finances, personnel, stock, menu, QR) | `/admin` |
| `serveur` | Tables, commandes, bar | `/staff` |
| `barman` | Commandes bar (boissons) | `/staff/bar` |
| `caissier` | Paiements, commandes | `/staff/commandes` |
| *Client (pas de login)* | Menu et commande via QR | `/qr/:tableId` |

---

## PARTIE 4 — La base de donnees (la memoire)

### C'est quoi une table de base de donnees ?

Imagine une feuille **Excel**. Chaque feuille = une table MySQL.

```
Table: utilisateurs
┌────┬────────┬─────────┬────────────────────┬──────────┬───────────┐
│ id │ nom    │ prenom  │ email              │ role     │ actif     │
├────┼────────┼─────────┼────────────────────┼──────────┼───────────┤
│  1 │ Admin  │ System  │ admin@barresto.cm  │ admin    │ true      │
│  2 │ Diallo │ Aminata │ aminata@barresto.cm│ serveur  │ true      │
│  3 │ Traore │ Moussa  │ moussa@barresto.cm │ serveur  │ true      │
└────┴────────┴─────────┴────────────────────┴──────────┴───────────┘
```

- **Chaque ligne** = un enregistrement
- **Chaque colonne** = un champ avec un type (texte, nombre, date, booleen)
- **`id`** = PRIMARY KEY : un identifiant UNIQUE qui ne change jamais

### Les 4 operations fondamentales (CRUD)

**CRUD = Create, Read, Update, Delete.** C'est TOUT ce que fait une API.

```sql
-- CREATE (ajouter une ligne)
INSERT INTO utilisateurs (nom, prenom, email, role)
VALUES ('Kone', 'Fatou', 'fatou@barresto.cm', 'serveur');

-- READ (lire des lignes)
SELECT * FROM utilisateurs WHERE role = 'serveur';

-- UPDATE (modifier une ligne)
UPDATE utilisateurs SET actif = FALSE WHERE id = 3;

-- DELETE (supprimer une ligne)
DELETE FROM utilisateurs WHERE id = 3;
```

### Les relations entre tables (Foreign Keys)

**Le concept le plus important :** Les tables sont reliees entre elles.

```
commandes          ←— chaque commande "appartient a" une table physique
    ↓
commande_items     ←— chaque commande "contient" plusieurs articles
    ↓
produits_menu      ←— chaque article "pointe vers" un produit du menu
```

En SQL, ca ressemble a ca :

```sql
commandes.table_id  →  tables_salle.id
commande_items.commande_id  →  commandes.id
commande_items.produit_menu_id  →  produits_menu.id
```

**Analogie :** Pense a des liens hypertextes. `table_id = 5` dans `commandes` c'est comme un lien vers la page "table numero 5" dans `tables_salle`.

### Les 16 tables du projet

```
1.  utilisateurs        — Comptes des employes (login, role, mot de passe)
2.  presences           — Qui est arrive/parti aujourd'hui
3.  tables_salle        — Tables physiques (numero, places, statut)
4.  commandes           — Commandes clients (statut, total, serveur)
5.  commande_items      — Articles de chaque commande (produit, quantite, prix)
6.  categories          — Categories du menu (Cocktails, Bieres, Plats...)
7.  produits_menu       — Produits du menu (nom, prix, photo, categorie)
8.  produits_stock      — Matieres premieres (stock actuel, minimum)
9.  mouvements_stock    — Historique entrees/sorties de stock
10. ravitaillements     — Receptions marchandises (fournisseurs)
11. transactions        — Operations financieres (entrees/sorties)
12. salaires            — Salaires employes par mois
13. impots_taxes        — Taxes a payer
14. paiements           — Paiements des commandes (especes, mobile money)
15. fournisseurs        — Fournisseurs du restaurant
16. inventaires         — Inventaires physiques du stock
```

**Note importante :** Le fichier `backend/database.sql` contient TOUTES les commandes SQL pour creer ces tables + des donnees de test. Tu n'as pas besoin de les creer a la main.

### Comment creer la base de donnees

```
1. Ouvre http://localhost/phpmyadmin dans ton navigateur
2. Clique "Nouvelle base de donnees" (menu en haut)
3. Nom : barresto_db
4. Interclassement : utf8mb4_general_ci
5. Clique "Creer"
6. Va dans l'onglet "Importer"
7. Clique "Choisir un fichier"
8. Navigue vers : backend/database.sql (dans ton dossier projet)
9. Clique "Executer"

Si tu vois des coches vertes → c'est bon, ta DB est prete.
```

### Les requetes utiles a connaitre

```sql
-- Voir toutes les commandes en cours avec leur table
SELECT c.id, c.statut, c.total, t.numero as table_numero, u.prenom as serveur
FROM commandes c
LEFT JOIN tables_salle t ON c.table_id = t.id
LEFT JOIN utilisateurs u ON c.serveur_id = u.id
WHERE c.statut IN ('en attente', 'en preparation', 'servie')
ORDER BY c.date DESC;

-- Voir les produits les plus vendus
SELECT pm.nom, SUM(ci.quantite) as total_vendu
FROM commande_items ci
JOIN produits_menu pm ON ci.produit_menu_id = pm.id
GROUP BY pm.nom
ORDER BY total_vendu DESC
LIMIT 10;

-- Voir les ruptures de stock
SELECT nom, stock_actuel, stock_min
FROM produits_stock
WHERE stock_actuel <= stock_min;
```

---

## PARTIE 5 — Le backend (le cerveau)

### 5.1 — Le fichier principal : server.js

`server.js` est le **POINT D'ENTREE**. C'est le premier fichier qui s'execute quand tu lances `node server.js`.

Voici l'anatomie, ligne par ligne :

```javascript
// === ZONE 1 : IMPORTS (on importe tout ce qu'on va utiliser) ===
const express = require("express");             // Le framework web
const path = require("path");                   /* Pour les chemins de fichiers */
const cors = require("cors");                   /* Autoriser le frontend a parler au backend */
const rateLimit = require("express-rate-limit");/* Limiter les requetes */
const helmet = require("helmet");               /* En-tetes de securite */
const { requireRole } = require("./middleware/auth"); /* Verifier le role */
const requestLogger = require("./middleware/requestLogger"); /* Logger */
const { logger } = require("./config/logger");  /* Logger */
require("dotenv").config();                     /* Charger les variables .env */

// === ZONE 2 : CREATION DE L'APP ===
const app = express();  // On cree l'application Express

// === ZONE 3 : MIDDLEWARES (des filtres qui tournent sur CHAQUE requete) ===
app.use(helmet());                              /* Securise les headers HTTP */
app.use(cors({ origin: [...] }));               /* Autorise http://localhost:5173 */
app.use(express.json({ limit: "10mb" }));       /* Transforme le body JSON en objet */
app.use(requestLogger);                         /* Logge chaque requete */

// === ZONE 4 : RATE LIMITING (empeche le spam) ===
const loginLimiter = rateLimit({ ... });        /* Max 5 logins / 15 min */
app.use("/api/auth/login", loginLimiter);

// === ZONE 5 : LES ROUTES (QUAND l'URL = X, FAIT Y) ===
app.use("/api/auth", authRoute);                /* Authentification */
app.use("/api/menu", adminIfWrite, menuRoute);  /* Menu (GET public, POST admin) */
app.use("/api/commandes", commandesAccess, ...);/* Commandes */
app.use("/api/tables", tablesAccess, ...);      /* Tables */
app.use("/api/stock", requireRole("admin"), ...);/* Stock (admin seul) */
// ... et toutes les autres routes

// === ZONE 6 : HEALTH CHECK (un "je suis vivant") ===
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// === ZONE 7 : LANCEMENT DU SERVEUR ===
app.listen(3000, () => {
  console.log("Bar API running on http://localhost:3000");
});
```

**Comment lire ce fichier :** De haut en bas. C'est l'ordre dans lequel les choses se passent quand une requete arrive.

### 5.2 — Les middlewares (les filtres)

**Un middleware, c'est une fonction qui s'execute AVANT ta route.** C'est comme un videur de boite de nuit.

```
Requete → [Middleware 1: CORS] → [Middleware 2: JSON] → [Middleware 3: Auth] → [Route]
           "Tu viens d'ou ?"      "Ton body est        "Tu es qui ?"         "OK,
                                    correct ?"                              je traite"
```

#### Exemple concret : le middleware d'authentification

```javascript
// middleware/auth.js

// Ce middleware cree un middleware — oui, une fonction qui retourne une fonction
function requireRole(role) {
  // Retourne la fonction middleware (req, res, next)
  return (req, res, next) => {
    // 1. Recupere le token de l'en-tete Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Connexion requise" });
    }

    // 2. Extrait le token (enleve "Bearer ")
    const token = authHeader.split(" ")[1];

    // 3. Verifie le token avec la cle secrete
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attache l'utilisateur a la requete
    req.user = decoded;  // Maintenant req.user = { id: 1, role: "admin" }

    // 5. Verifie le role
    if (typeof role === "string" && decoded.role !== role) {
      return res.status(403).json({ success: false, message: "Acces interdit" });
    }

    // 6. Tout est bon, on continue vers la route
    next();
  };
}
```

**Quand tu vois `requireRole("admin")` sur une route, ca veut dire :**
"Seuls les tokens avec `role: 'admin'` peuvent acceder. Les autres sont bloques avec une erreur 403."

### 5.3 — Les routes (les URL → actions)

**Une route, c'est une adresse URL + une methode HTTP = une action.**

```
POST    /api/auth/login          →   Connexion (verifie mot de passe, renvoie token)
GET     /api/tables              →   Lire toutes les tables
POST    /api/tables              →   Creer une nouvelle table
PATCH   /api/tables/5            →   Modifier la table numero 5
DELETE  /api/tables/5            →   Supprimer la table 5
GET     /api/menu/produits       →   Lire le menu
POST    /api/commandes           →   Creer une commande
PATCH   /api/commandes/3/paiement → Payer la commande 3
PATCH   /api/commandes/3/transferer → Transférer la commande 3 a une autre table
```

#### Exemple complet : la route de creation de commande

```javascript
// routes/commandes.js

router.post("/", async (req, res) => {
  try {
    const { table_id, serveur_id, items } = req.body;
    // req.body = { table_id: 5, serveur_id: 2, items: [{produit_id: 1, quantite: 2}] }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();  /* On commence une transaction */

      // 1. Cree la commande
      const [result] = await conn.query(
        "INSERT INTO commandes (table_id, serveur_id, total, date) VALUES (?, ?, 0, CURDATE())",
        [table_id, serveur_id]
      );
      const commandeId = result.insertId;  /* L'ID de la nouvelle commande */

      // 2. Cree chaque article
      let total = 0;
      for (const item of items) {
        /* Pour chaque article, on va chercher son prix dans produits_menu */
        const [produit] = await conn.query(
          "SELECT prix FROM produits_menu WHERE id = ?",
          [item.produit_id]
        );
        const sousTotal = produit[0].prix * item.quantite;
        total += sousTotal;

        await conn.query(
          "INSERT INTO commande_items (commande_id, produit_menu_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)",
          [commandeId, item.produit_id, item.quantite, produit[0].prix]
        );
      }

      // 3. Met a jour le total de la commande
      await conn.query("UPDATE commandes SET total = ? WHERE id = ?", [total, commandeId]);

      // 4. Met la table comme occupee
      await conn.query("UPDATE tables_salle SET statut = 'occupee' WHERE id = ?", [table_id]);

      await conn.commit();  /* Tout est OK, on sauvegarde ! */
      res.json({ success: true, commandeId, total });

    } catch (err) {
      await conn.rollback();  /* Quelque chose a plante → ON ANNULE TOUT */
      res.status(500).json({ success: false, message: err.message });
    } finally {
      conn.release();  /* On libere la connexion MySQL */
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

**Pourquoi une transaction ici ? Parce que si l'etape 2.3 plante, tu ne veux PAS une commande qui n'a que 2 articles sur 3. Soit tout est cree, soit rien n'est cree.**

### 5.4 — Comment creer une route de zero

Si tu veux ajouter une fonctionnalite, voici l'ordre :

1. **Identifie la table DB concernee** (ex: tu veux gerer les reservations → table `reservations`)
2. **Cree le fichier route** dans `backend/routes/` (ex: `reservations.js`)
3. **Declare la route dans server.js** (`app.use("/api/reservations", reservationsRoute)`)
4. **Test avec curl ou Postman** avant de toucher au frontend

```bash
# Test rapide : est-ce que ma route existe ?
curl http://localhost:3000/api/reservations

# Test POST : est-ce que je peux creer une reservation ?
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"table_id": 5, "nom": "Kone", "date": "2025-04-20"}'
```

---

## PARTIE 6 — Le frontend (l'ecran)

### 6.1 — Le point d'entree : main.jsx

```javascript
// main.jsx — Le PREMIER fichier qui s'execute

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Il fait UNE SEULE chose :** Il dit "Prends le composant `<App />` et affiche-le dans la div avec id='root' du fichier `index.html`."

### 6.2 — Le router : App.jsx

`App.jsx` est le **GPS** de l'application. Il decide quelle page afficher selon l'URL.

```javascript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/change-password" element={<ChangePassword />} />

  {/* Admin : seulement si role = "admin" */}
  <Route path="/admin/*" element={
    <RequireAuth role="admin"><AdminLayout />
  }>
    <Route index element={<AdminDashboard />} />       {/* /admin */}
    <Route path="finances" element={<Finances />} />   {/* /admin/finances */}
    <Route path="rapports" element={<Rapports />} />   {/* /admin/rapports */}
    <Route path="personnel" element={<Personnel />} /> {/* /admin/personnel */}
    <Route path="stock" element={<Stock />} />         {/* /admin/stock */}
    <Route path="menu" element={<MenuAdmin />} />      {/* /admin/menu */}
    <Route path="qrcodes" element={<QRCodes />} />     {/* /admin/qrcodes */}
    <Route path="historique-connexions" element={<ConnectionHistory />} />
  </Route>

  {/* Staff : tous les roles connectes */}
  <Route path="/staff/*" element={
    <RequireAuth><StaffLayout />
  }>
    <Route index element={<StaffDashboard />} />       {/* /staff */}
    <Route path="tables" element={<StaffTables />} />  {/* /staff/tables */}
    <Route path="commandes" element={<StaffCommandes />} />
    <Route path="bar" element={<StaffBar />} />        {/* /staff/bar */}
  </Route>

  {/* Client : pas de login, acces par QR code */}
  <Route path="/qr/:tableId" element={<ClientQRPage />} />

  {/* Toute autre URL → redirect vers login */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
```

**Le gardien `RequireAuth` :**
- Si pas connecte → redirige vers `/login`
- Si connecte mais pas le bon role → redirige vers `/admin` ou `/staff`

### 6.3 — Les composants React (les briques)

**Un composant React = une fonction qui retourne du JSX (HTML dans du JavaScript).**

```javascript
// components/ui/button.jsx — Un composant simple

export function Button({ children, onClick, variant = "primary" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium ${
        variant === "primary"
          ? "bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950"
          : "bg-white/5 text-white border border-white/10"
      }`}
    >
      {children}
    </button>
  );
}
```

**Comment on l'utilise :**
```jsx
<Button onClick={() => alert("clique !")}>Clique ici</Button>
```

### 6.4 — Les hooks React (les super-pouvoirs)

| Hook | A quoi ca sert | Exemple |
|------|----------------|---------|
| `useState` | Memoriser une valeur qui change | `const [nom, setNom] = useState("")` |
| `useEffect` | Executer du code au montage ou quand qqch change | Charger des donnees |
| `useRef` | Memoriser sans re-rendre | Compteur d'anciennes commandes |
| `useMemo` | Memoriser un calcul lent | Filtrer une longue liste |

#### useState en profondeur

```javascript
function Compteur() {
  const [nombre, setNombre] = useState(0);  // Commence a 0

  return (
    <div>
      <p>{nombre}</p>
      <button onClick={() => setNombre(nombre + 1)}>+ 1</button>
    </div>
  );
}
```

**Ce qui se passe quand tu cliques :**
1. `setNombre(1)` est appele
2. React voit que l'etat a change
3. React "re-rend" le composant (re-execute la fonction)
4. Cette fois, `nombre` vaut `1`, donc le `<p>` affiche `1`
5. L'ecran se met a jour (seule la partie changee, pas tout)

#### useEffect en profondeur

```javascript
function PageTables() {
  const [tables, setTables] = useState([]);
  const fetchTables = useAppStore((s) => s.fetchTables);

  useEffect(() => {
    // Ce code s'execute QUAND ?
    fetchTables();
  }, []);  // ← Ce [] dit : "UNE SEULE FOIS, au montage"

  return <div>{/* affiche les tables */}</div>;
}
```

**Les differentes valeurs du `[]` :**
- `[]` → "Une seule fois quand la page s'ouvre"
- `[variable]` → "Au debut + chaque fois que `variable` change"
- Pas de `[]` → "A CHAQUE rendu" (ATTENTION, c'est souvent un bug)

### 6.5 — Zustand : le magasin central

**Le probleme :** Deux composants ont besoin des memes donnees. Comment ils se les partagent sans se les passer de parent en enfant ?

**La solution :** Un "magasin" ou tout le monde va chercher.

```javascript
// store/appStore.js — Le magasin central

import { create } from "zustand";

export const useAppStore = create((set, get) => ({
  // DONNEES (l'etat initial)
  user: null,                         /* L'utilisateur connecte */
  tables: [],                         /* La liste des tables */
  commandesEnCours: [],              /* Les commandes en cours */
  produits: [],                      /* Le menu */

  // ACTIONS (fonctions pour modifier les donnees)
  login: (userData) => set({ user: userData }),
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },

  fetchTables: () =>
    apiFetch("/tables").then((d) => {
      if (d.success) set({ tables: d.tables });
    }),

  fetchCommandesEnCours: () =>
    apiFetch("/commandes/en-cours").then((d) => {
      if (d.success) set({ commandesEnCours: d.commandes });
    }),

  // ... et toutes les autres actions
}));
```

**Comment un composant utilise le store :**

```javascript
function MaPage() {
  // Je "souscris" aux tables
  const tables = useAppStore((s) => s.tables);
  // Je prends l'action
  const fetchTables = useAppStore((s) => s.fetchTables);

  // Je charge au montage
  useEffect(() => { fetchTables(); }, [fetchTables]);

  return (
    <div>
      {tables.map(t => <p key={t.id}>Table {t.numero} — {t.statut}</p>)}
    </div>
  );
}
```

**Le secret :** Quand `set({ tables: [...] })` est appele, TOUS les composants qui lisent `tables` se re-rendent automatiquement.

### 6.6 — api.js : la fonction qui parle au backend

```javascript
// api.js — UNE fonction pour TOUTES les requetes

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_URL}${path}`, { ...options, headers })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Erreur serveur" };
      }
      return data;
    })
    .catch((err) => {
      console.error("Erreur fetch:", err);
      return { success: false, message: "Erreur reseau" };
    });
}
```

**Pourquoi une fonction unique ?** Parce que :
1. Elle ajoute automatiquement le token JWT a chaque requete
2. Elle gere les erreurs au meme endroit
3. Si un jour tu changes l'URL du backend, tu changes UNE SEULE ligne

---

## PARTIE 7 — Comment tout se connecte (un flux complet)

### Le flux de connexion (Login), de A a Z

C'est le flux le plus important. Si tu le comprends, tu comprends 80% du projet.

```
ETAPE 1 : L'utilisateur est sur http://localhost:5173/login
          Il tape son email et mot de passe, clique "Connexion"

ETAPE 2 : Login.jsx (frontend)
          → Recupere email + mot de passe du formulaire
          → Appelle le store : login(email, password)

ETAPE 3 : appStore.js (frontend — Zustand)
          → Appelle apiFetch("/auth/login", { method: "POST", body: {...} })
          → Cette fonction fait :
              fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, mot_de_passe })
              })

ETAPE 4 : Le backend (Express) recoit la requete
          → CORS laisse passer (localhost:5173 est autorise)
          → express.json() transforme le body en objet JS
          → La route /api/auth/login est matchee
          → router.post("/login", ...) s'execute

ETAPE 5 : routes/auth.js (backend)
          → SELECT * FROM utilisateurs WHERE email = ?
          → Si trouve : bcrypt.compare(mot_de_passe_tape, hash_en_db)
          → Si OK : jwt.sign({ id, role }, JWT_SECRET) → cree un token
          → Renvoie : { success: true, user: {...}, token: "eyJhbG..." }

          → Si pas OK : { success: false, message: "Identifiants incorrects" }

ETAPE 6 : Le frontend recoit la reponse
          → Si success = true :
              localStorage.setItem("token", response.token)
              set({ user: response.user })  ← Zustand met a jour l'etat
          → Si success = false :
              Affiche le message d'erreur sous le formulaire

ETAPE 7 : React re-rend automatiquement
          → Le RequireAuth voit que user n'est plus null
          → Il redirige vers /admin (si admin) ou /staff (si serveur)
          → La page dashboard se charge avec les donnees du store
```

---

## PARTIE 8 — Lancer le projet (checklist infaillible)

### Checklist de lancement

```
[ ] 1. WAMP est lance et l'icone est VERTE
[ ] 2. La base de donnees barresto_db existe dans phpMyAdmin
[ ] 3. Le dossier backend a un fichier .env valide
[ ] 4. Les dependances backend sont installees (node_modules existe)
[ ] 5. Les dependances frontend sont installees (node_modules existe)
[ ] 6. Le backend tourne (tu vois "Bar API running on...")
[ ] 7. Le frontend tourne (tu vois "Local: http://localhost:5173")
[ ] 8. Tu peux acceder a http://localhost:5173 dans ton navigateur
[ ] 9. Tu peux te connecter avec admin@barresto.cm / admin123
```

### Detail de chaque etape

#### Etape 1 : Verifier les outils

```bash
node --version    # → v20.x.x
npm --version     # → 10.x.x
# WAMP → icone verte dans la barre des taches
```

#### Etape 2 : La base de donnees

Ouvre phpMyAdmin (http://localhost/phpmyadmin) et verifie que `barresto_db` existe dans la liste a gauche.

#### Etape 3 : Le backend

```bash
cd /c/Users/AMZA/Desktop/bar-restaurant/backend

# Verifier le .env
# Il doit contenir :
#   DB_HOST=localhost
#   DB_USER=root
#   DB_PASSWORD=          (vide si WAMP par defaut)
#   DB_NAME=barresto_db
#   PORT=3000
#   JWT_SECRET=dev_secret_do_not_use_in_production

# Installer les dependances (une seule fois)
npm install

# Lancer le serveur
node server.js
```

Tu dois voir :
```
[INFO] Bar API running on http://localhost:3000
[INFO] Database : barresto_db
[INFO] Frontend : http://localhost:5173
```

**Test rapide (nouveau terminal) :**
```bash
curl http://localhost:3000/api/health
# Doit repondre : {"status":"ok","time":"..."}
```

#### Etape 4 : Le frontend

Ouvre un **NOUVEAU** terminal (ne ferme pas le backend !)

```bash
cd /c/Users/AMZA/Desktop/bar-restaurant/frontend

# Installer les dependances (une seule fois)
npm install

# Lancer le serveur de dev
npm run dev
```

Tu dois voir :
```
VITE v5.x.x ready in xxx ms
Local:   http://localhost:5173/
```

Ouvre `http://localhost:5173/` dans ton navigateur.

### Comptes de test

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@barresto.cm` | `admin123` |
| Serveur | `aminata@barresto.cm` | `serveur123` |
| Serveur | `moussa@barresto.cm` | `serveur123` |

---

## PARTIE 9 — Bugs courants + solutions exactes

### Bug #1 : Le backend ne demarre pas

**Symptome :** Erreur en lancant `node server.js`

| Message d'erreur | Cause | Solution |
|------------------|-------|----------|
| `Cannot find module 'express'` | Dependances pas installees | `cd backend && npm install` |
| `Access denied for user 'root'` | Mauvais mot de passe DB | Verifie `DB_PASSWORD` dans `.env` |
| `Unknown database 'barresto_db'` | DB pas creee | Creer dans phpMyAdmin + importer database.sql |
| `JWT_SECRET non defini` | Fichier .env manquant | Creer `.env` dans backend/ avec toutes les variables |
| `Port 3000 already in use` | Quelque chose utilise deja le port 3000 | Ferme l'autre programme, ou change le PORT dans .env |

### Bug #2 : Page blanche sur le frontend

**Ouvre la console du navigateur (F12 → Console) et lis l'erreur.**

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Failed to fetch` | Backend pas lance | Lance le backend (`node server.js`) |
| `Cannot read properties of undefined` | Bug JavaScript | Lis la ligne dans la console, corrige le code |
| `ERR_CONNECTION_REFUSED` | Backend ou Vite pas lance | Verifie les deux terminaux |
| Import manquant | `useState` ou un composant non importe | `import { useState } from "react"` |

### Bug #3 : Le frontend ne se connecte pas au backend

**4 points a verifier :**

```bash
# 1. Backend tourne ?
curl http://localhost:3000/api/health

# 2. Le frontend utilise le bon port ?
# Verifie vite.config.js → proxy ou VITE_API_URL

# 3. CORS est OK ?
# server.js doit autoriser http://localhost:5173

# 4 . Le token est present ?
# Dans le navigateur, F12 → Application → Local Storage → "token"
```

### Bug #4 : `setInterval` qui fait planter l'app

```javascript
// ❌ 5 millisecondes = 200 requetes/seconde → le serveur est sature
setInterval(checkCommandes, 5);

// ✅ 5 secondes = 1 requete toutes les 5 secondes
setInterval(checkCommandes, 5000);
```

**Regle :** Les intervalles de `setInterval` sont en **MILLISECONDES**. 1000 = 1 seconde.

### Bug #5 : Transfert de commande bloque

**Cause :** Le code verifiait si la table etait "libre" au lieu de "reservee".

```javascript
// ❌ AVANT — bloquait les transfers vers tables occupees
if (table[0].statut !== 'libre') return res.status(400).json(...);

// ✅ APRES — bloque uniquement les reservees
if (table[0].statut === 'reservee') return res.status(400).json(...);
```

### Bug #6 : "401 Unauthorized" sur toutes les requetes

- Verifie que le token existe : F12 → Application → Local Storage
- Verifie que le `JWT_SECRET` dans `.env` est le meme que celui qui a signe le token
- Si tu as change le JWT_SECRET, deconnecte-toi et reconnecte-toi

### Bug #7 : Images du menu ne s'affichent pas

- Verifie que le dossier `backend/uploads/menu/` contient les fichiers
- Verifie la route `/uploads/menu` dans `server.js` (static files)
- Verifie l'URL dans le browser network tab (F12 → Network)

---

## PARTIE 10 — Comment ajouter une fonctionnalite (methode)

### La methode en 5 etapes

Tu veux ajouter quelque chose ? Suis TOUJOURS cet ordre :

**ETAPE 1 : La base de donnees**
- Quelle table ? Existe-t-elle ? Quelles colonnes ?
- Si nouvelle table → ajoute les `CREATE TABLE` dans `database.sql`

**ETAPE 2 : Le backend (la route)**
- Cree ou modifie un fichier dans `backend/routes/`
- Test avec `curl` ou Postman

**ETAPE 3 : Le frontend (l'action du store)**
- Ajoute une fonction dans `store/appStore.js`
- Exemple : `createReservation: (data) => apiFetch("/reservations", ...)`

**ETAPE 4 : Le frontend (la page)**
- Cree ou modifie un composant dans `pages/`
- Ajoute la route dans `App.jsx`

**ETAPE 5 : Le test**
- Relance le backend si necessaire
- Va sur la page, teste le flux

### Exemple : Ajouter un systeme de reservations

**ETAPE 1 : DB**
```sql
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT,
  client_nom VARCHAR(100),
  client_telephone VARCHAR(20),
  date_reservation DATE,
  heure TIME,
  statut ENUM('confirmee', 'annulee', 'terminee') DEFAULT 'confirmee',
  FOREIGN KEY (table_id) REFERENCES tables_salle(id)
);
```

**ETAPE 2 : Backend**
```javascript
// backend/routes/reservations.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET toutes les reservations
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM reservations ORDER BY date_reservation DESC");
  res.json({ success: true, reservations: rows });
});

// POST creer une reservation
router.post("/", async (req, res) => {
  const { table_id, client_nom, client_telephone, date_reservation, heure } = req.body;
  const [result] = await pool.query(
    "INSERT INTO reservations (table_id, client_nom, client_telephone, date_reservation, heure) VALUES (?,?,?,?,?)",
    [table_id, client_nom, client_telephone, date_reservation, heure]
  );
  res.json({ success: true, reservationId: result.insertId });
});

module.exports = router;
```

Puis dans `server.js` :
```javascript
const reservationsRoute = require("./routes/reservations");
app.use("/api/reservations", requireRole("admin"), reservationsRoute);
```

**ETAPE 3 : Store**
```javascript
// Dans appStore.js
reservations: [],
fetchReservations: () =>
  apiFetch("/reservations").then((d) => {
    if (d.success) set({ reservations: d.reservations });
  }),
createReservation: (data) =>
  apiFetch("/reservations", { method: "POST", body: JSON.stringify(data) }).then((d) => {
    if (d.success) get().fetchReservations();
    return d;
  }),
```

**ETAPE 4 : Page**
```jsx
// pages/Reservations.jsx
function Reservations() {
  const reservations = useAppStore((s) => s.reservations);
  const fetchReservations = useAppStore((s) => s.fetchReservations);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  return (
    <div>
      <h1>Reservations</h1>
      {reservations.map(r => (
        <p key={r.id}>{r.client_nom} — {r.date_reservation} a {r.heure}</p>
      ))}
    </div>
  );
}
```

Puis dans `App.jsx` :
```javascript
import { Reservations } from "./pages/Reservations";
//Dans les routes admin :
<Route path="reservations" element={<Reservations />} />
```

**ETAPE 5 : Test**
- Relance le backend
- Va sur `/admin/reservations`

---

## PARTIE 11 — Lexique

| Mot | Signification | Analogie |
|-----|---------------|----------|
| **API** | Interface entre frontend et backend | Le menu du restaurant (ce que tu peux commander) |
| **Backend** | Programme serveur qui traite les requetes | La cuisine |
| **Frontend** | Interface dans le navigateur | La salle et le menu |
| **HTTP** | Protocole de communication | Le langage entre client et serveur |
| **JSON** | Format de donnees `{ "cle": "valeur" }` | Une enveloppe avec des info ecrites |
| **Route** | Un endpoint API (`/api/tables`) | L'adresse ou tu envoies ta demande |
| **Middleware** | Un filtre avant la route | Le videur qui verifie avant de laisser entrer |
| **Token JWT** | Carte d'identite numerique | Ton badge d'employe |
| **Hook** | Fonction speciale React | Un outil de ta boite a outils |
| **Composant** | Brique UI reutilisable | Une piece LEGO |
| **Store** | Etat global partage | Le tableau d'affichage central |
| **Requete SQL** |Commande a la DB | Un ordre donne au bibliothecaire |
| **Foreign Key** | Lien entre deux tables | Un hyperlien entre pages |
| **Transaction** | Groupe de requetes tout-ou-rien | Un virement bancaire (debit + credit ensemble) |
| **CORS** | Securite du navigateur | La liste des sites autorises |
| **Rate Limit** | Limite de requetes | "Max 3 commandes en meme temps" |
| **npm** | Gestionnaire de paquets JS | Le magasin de briques LEGO |
| **Vite** | Bundler/frontend dev server | L'ouvrier qui assemble tout |
| **JSX** | HTML dans du JavaScript | Du francais avec des maths dedans |
| **SPA** | Single Page Application | Une seule page, le contenu change dynamiquement |
| **bcrypt** | Hash de mot de passe | Un mixeur dont on ne peut pas revenir en arriere |
| **Zustand** | Gestion d'etat global | Un tableau blanc partage |
| **Tailwind** | CSS via classes utilitaires | Des etiquettes de style directement sur les elements |

---

## PARTIE 12 — Checklist de reproduction (plan de bataille)

Si tu voulais refaire ce projet de zero, voici l'ordre **EXACT** :

```
PHASE 1 : INFRASTRUCTURE (1 jour)
  [ ] Installer Node.js, WAMP, VS Code, Git Bash
  [ ] Creer la DB barresto_db dans phpMyAdmin
  [ ] Importer database.sql

PHASE 2 : BACKEND MINIMUM (2-3 jours)
  [ ] Creer dossier backend avec :
      package.json (express, mysql2, cors, dotenv, bcrypt, jsonwebtoken)
      server.js (Express basique)
      config/db.js (connexion MySQL)
  [ ] Creer routes/auth.js → POST /login (test avec curl)
  [ ] Creer routes/tables.js → GET /tables (test avec curl)
  [ ] Creer routes/commandes.js → POST /commandes (test avec curl)
  [ ] Verifier : chaque route repond correctement avec curl

PHASE 3 : FRONTEND MINIMUM (2-3 jours)
  [ ] Creer l'app : npm create vite@latest frontend -- --template react
  [ ] Installer : react-router-dom zustand axios tailwindcss
  [ ] Configurer Tailwind
  [ ] Creer la page Login (juste le formulaire visuel)
  [ ] Connecter le login au backend
  [ ] Creer le store Zustand
  [ ] Creer AdminLayout (sidebar + zone contenu)
  [ ] Creer la page tables (liste simple)
  [ ] Verifier : login → voir les tables

PHASE 4 : FONCTIONNALITE CORE (3-4 jours)
  [ ] Page commandes (creer, voir les items)
  [ ] Transfert de commande entre tables
  [ ] Changement de statut (en attente → preparation → servie)
  [ ] Paiement d'une commande

PHASE 5 : CLIENT QR (1-2 jours)
  [ ] Page /qr/:tableId (sans auth)
  [ ] Affichage du menu
  [ ] Commande depuis la page client

PHASE 6 : ADMIN COMPLET (3-4 jours)
  [ ] Dashboard avec stats
  [ ] Page finances
  [ ] Page personnel
  [ ] Page stock
  [ ] Page menu (creer/modifier produits avec upload photo)
  [ ] Page QR codes

PHASE 7 : POLISH (1-2 jours)
  [ ] Gestion du first login (changement mot de passe oblige)
  [ ] Tracking des connexions
  [ ] Historique des connexions
  [ ] Rate limiting sur login
  [ ] Gestion d'erreurs propre (toasts, alerts)
  [ ] Responsive design (mobile)
```

**La regle d'or :** Chaque phase = test complete avant de passer a la suivante.
Ne saute JAMAIS une phase. Ne fais JAMAIS deux phases en meme temps.

---

## Questions frequentes de debutant

**Q : Comment je sais si mon code a fonctionne ?**
R : 3 endroits a regarder :
1. Le terminal du backend (erreurs en rouge ?)
2. La console du navigateur (F12 → Console)
3. L'onglet Network du navigateur (F12 → Network → clique sur la requete → regarde la reponse)

**Q : Comment je debogue ?**
R : `console.log()` est ton meilleur ami. Mets-en partout :
```javascript
function maFonction(data) {
  console.log("J'ai recu:", data);  // ← Qu'est-ce que j'ai ?
  const result = quelqueChose(data);
  console.log("Resultat:", result);  // ← Qu'est-ce que j'obtiens ?
  return result;
}
```

**Q : Est-ce que je peux tout faire en un jour ?**
R : Non. Ce projet represents 2-3 semaines de travail pour un debutant. Ne te presse pas.

**Q : Par ou commencer si je suis bloque ?**
R : Toujours par le plus petit morceau possible. Commence par "afficher un texte a l'ecran". Puis "afficher une variable". Puis "afficher une donnee de la DB". Petit a petit.

**Q : Comment savoir quelle table DB modifier ?**
R : Le nom de la page te le dit generalement :
- Page "tables" → table `tables_salle`
- Page "commandes" → tables `commandes` + `commande_items`
- Page "stock" → table `produits_stock` + `mouvements_stock`
- Page "finances" → table `transactions`

**Q : Comment faire pour que le backend redemarre automatiquement ?**
R : Installe `nodemon` dans le backend :
```bash
npm install -D nodemon
# Puis lance avec : npx nodemon server.js
# Il redemarre a chaque modification de fichier
```

---

## Pour aller plus loin

Une fois que tu comprends ce guide :

1. **Lis le code fichier par fichier** — Ouvre chaque fichier du projet et essaie de comprendre. Commence par `server.js`, puis `routes/auth.js`, puis `App.jsx`, puis `store/appStore.js`.

2. **Modifie quelque chose de petit** — Change une couleur, ajoute un log, modifie un texte. Vois ce qui change.

3. **Ajoute une fonctionnalite simple** — Suis la methode de la Partie 10.

4. **Lis la documentation officielle** :
   - React : https://react.dev/learn
   - Express : https://expressjs.com/
   - MySQL : https://dev.mysql.com/doc/

---

*Ce guide est vivant. Si quelque chose n'est pas clair ou si tu trouves un bug, note-le et on l'ajustera ensemble.*
