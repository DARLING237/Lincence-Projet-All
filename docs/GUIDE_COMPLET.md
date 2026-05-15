# Guide Complet — Developper une Application Bar-Restaurant de A à Z

> Ce guide explique chaque décision technologique, chaque architecture, chaque
> concept. À la fin, tu dois être capable de reproduire cette application seul.

---

## Table des matieres

1. [L'architecture globale](#1-larchitecture-globale)
2. [La base de donnees](#2-la-base-de-donnees)
3. [Le Backend — Express.js + MySQL](#3-le-backend--expressjs--mysql)
4. [Le Frontend — React + Vite + Zustand](#4-le-frontend--react--vite--zustand)
5. [La communication Frontend ↔ Backend](#5-la-communication-frontend--backend)
6. [La securite](#6-la-securite)
7. [Les tests](#7-les-tests)
8. [Guide de developpement — pages, flux et erreurs courantes](#8-guide-de-developpement--pages-flux-et-erreurs-courantes)
9. [Le deploiement — Cloudflare Pages + VPS](#9-le-deploiement--cloudflare-pages--vps)
10. [Exercice pratique](#10-exercice-pratique)
---

## 1. L'architecture globale

```
                    ┌─────────────────┐
                    │    Navigateur    │
                    │  (React + Vite)  │
                    └────────┬────────┘
                             │ HTTP / JSON
                             │ fetch()
                             ▼
                    ┌─────────────────┐
                    │     Backend      │
                    │  (Express.js)    │
                    └────────┬────────┘
                             │ Requetes SQL parametrees
                             ▼
                    ┌─────────────────┐
                    │  MySQL (Base)    │
                    └─────────────────┘
```

**Pourquoi cette architecture ?**

- **3 couches separees** : Le frontend ne connait pas la base de donnees. Le backend fait l'intermediaire. C'est le pattern le plus courant en entreprise.
- **HTTP/JSON** : Le frontend parle au backend via des requetes HTTP qui retournent du JSON. C'est universel — n'importe quel client (mobile, web, autre) peut parler a ton API.
- **API REST** : On utilise des verbes HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) sur des ressources (`/api/commandes`, `/api/stock`). C'est un standard — une fois que tu comprends le pattern, tu comprends 90% des APIs du marche.

**Structure du projet :**

```
bar-restaurant/
├── backend/              ← Serveur Node.js qui expose l'API
│   ├── config/           ← Configuration (connexion DB, logger)
│   ├── middleware/        ← Fonctions qui tournent AVANT les routes
│   ├── routes/           ← Les endpoints de l'API (un fichier par domaine)
│   ├── scripts/          ← Scripts utilitaires (backup, migration)
│   ├── tests/            ← Tests automatiques
│   ├── server.js         ← Point d'entree de l'app
│   ├── database.sql      ← Schema + donnees de test
│   └── package.json      ← Dependances Node.js
├── frontend/             ← Application React visible dans le navigateur
│   ├── src/
│   │   ├── store/        ← Etat global (Zustand)
│   │   ├── pages/        ← Les ecrans (Login, Dashboard, etc.)
│   │   ├── components/   ← Composants reutilisables (boutons, badges...)
│   │   ├── App.jsx       ← Le routeur (qui affiche quoi quand)
│   │   └── main.jsx      ← Point d'entree React
│   └── package.json      ← Dependances Frontend
└── docs/                 ← Ce guide
```

---

## 2. La base de donnees

### Pourquoi MySQL (et pas MongoDB ou autre) ?

Parce que tes donnees sont **relationnelles** :
- Une commande a un serveur (qui est un utilisateur)
- Une commande a des items (qui pointent vers des produits du menu)
- Un produit appartient a une categorie
- Un ravitaillement vient d'un fournisseur

Avec le SQL, tu peux faire des `JOIN` pour recuperer tout ca en une seule requete.

### Les 16 tables et leurs relations

```
utilisateurs ─┬──> commandes ──────> commande_items ──> produits_menu ──> categories
              │                        │
              │                        └───> tables_salle
              │
              ├──> presences
              ├──> salaires
              │
              └──> manageur_id ──> inventaires

fournisseurs ──> ravitaillements ──> ravitaillement_details ──> produits_stock
                                                    │
                                                    └──> mouvements_stock

transactions (journal financier independant)
impots_taxes (impots a payer)
```

**Regardons chaque groupe de tables :**

```sql
-- GROUPE 1 : Authentification
CREATE TABLE utilisateurs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe  VARCHAR(255) NOT NULL,
  role          ENUM('admin','serveur','caissier','cuisinier','barman') NOT NULL,
  poste         VARCHAR(100) DEFAULT NULL,
  actif         BOOLEAN      DEFAULT TRUE
);
```

**Pourquoi `VARCHAR(255)` pour le mot de passe ?** Parce qu'un hash bcrypt fait ~60 caracteres. `UNIQUE` sur l'email empeche deux comptes avec le meme email. `ENUM` force le role a etre l'une des valeurs listees — impossible d'inventer un role.

```sql
-- GROUPE 2 : Gestion des commandes
CREATE TABLE commandes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  table_id   INT DEFAULT NULL,
  serveur_id INT NOT NULL,
  statut     ENUM('en attente','en preparation','servie','payee','annulee'),
  total      BIGINT DEFAULT 0,
  heure      TIME,
  date       DATE,
  source     ENUM('staff','qr_client') DEFAULT 'staff',
  FOREIGN KEY (table_id)   REFERENCES tables_salle(id),
  FOREIGN KEY (serveur_id) REFERENCES utilisateurs(id)
);

CREATE TABLE commande_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  commande_id     INT NOT NULL,
  produit_menu_id INT NOT NULL,
  quantite        INT NOT NULL DEFAULT 1,
  prix_unitaire   BIGINT NOT NULL,
  type_poste      ENUM('cuisine','bar') NOT NULL,
  statut          ENUM('en attente','en preparation','pret','servi','annule'),
  FOREIGN KEY (commande_id)  REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_menu_id) REFERENCES produits_menu(id)
);
```

**Pourquoi separer `commandes` et `commande_items` ?** C'est la **forme normale** : une commande peut avoir 1, 5 ou 20 articles. Si on mettait tout dans une seule table, on aurait des donnees redondantes (le meme `table_id` repete pour chaque article). La solution : une table pour la commande (une fois), une pour les articles (autant de fois que d'articles).

**`ON DELETE CASCADE`** : Si on supprime une commande, ses items sont supprimes automatiquement. Pas besoin de deux requetes.

```sql
-- GROUPE 3 : Stock et fournisseurs
CREATE TABLE produits_stock (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nom             VARCHAR(120) NOT NULL,
  unite           VARCHAR(30)  NOT NULL,
  stock_actuel    DECIMAL(10,2) DEFAULT 0,
  stock_min       DECIMAL(10,2) DEFAULT 0,
  alerte          BOOLEAN       DEFAULT FALSE
);
```

**Pourquoi `DECIMAL(10,2)` et pas `INT` ?** Parce que le stock peut etre `3.50 kg`. `DECIMAL(10,2)` = jusqu'a 10 chiffres au total, dont 2 apres la virgule.

```sql
-- GROUPE 4 : Finances
CREATE TABLE transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type_op     ENUM('entree','sortie') NOT NULL,
  categorie   VARCHAR(80)   NOT NULL,
  montant     BIGINT         NOT NULL,
  reference   VARCHAR(60)   DEFAULT NULL,
  description TEXT          DEFAULT NULL,
  date        DATE          DEFAULT NULL
);
```

**Pourquoi `BIGINT` pour les prix ?** On stocke les montants en unite entiere (FCFA). `4500` = 4500 FCFA. Pas de decimales, pas de problemes de floating point.

### Le concept des cles etrangeres (`FOREIGN KEY`)

```sql
FOREIGN KEY (serveur_id) REFERENCES utilisateurs(id)
```

Ca veut dire : "Le `serveur_id` dans cette table DOIT correspondre a un `id` existant dans la table `utilisateurs`." C'est une **contrainte d'integrite**. Si tu essayes d'inserer `serveur_id = 999` et que l'utilisateur 999 n'existe pas, MySQL refuse. Ca protege tes donnees contre les incoherences.

### Les index et la performance

Quand tu declares `email VARCHAR(150) NOT NULL UNIQUE`, MySQL cree automatiquement un **index** sur la colonne `email`. Un index c'est comme le sommaire d'un livre : au lieu de parcourir toutes les lignes, MySQL va directement a la bonne. C'est pourquoi `WHERE email = 'xxx'` est rapide meme avec 1 million d'utilisateurs.

---

## 3. Le Backend — Express.js + MySQL

### Pourquoi Node.js + Express ?

- **Un seul langage** : JavaScript cote client ET cote serveur
- **Express** est minimaliste : il ne t'impose rien, tu construis ce dont tu as besoin
- **Non-bloquant (async)** : Express peut gerer plusieurs requetes en meme temps sans bloquer

### server.js — Le fichier principal

C'est le "chef d'orchestre" de ton API. Il fait 4 choses :

```javascript
const express = require("express");
const app = express();

// 1. Les "plugins" globaux (middleware)
app.use(helmet());                        // En-tetes HTTP de securite
app.use(cors({ origin: [...] }));          // Autoriser le frontend a parler au backend
app.use(express.json());                   // Parser le JSON dans les requetes
app.use(express.static('public'));         // Servir les fichiers statiques

// 2. Les routes — on dit a Express quoi faire pour chaque URL
app.use("/api/auth", authRoute);           // POST /api/auth/login, POST /api/auth/register
app.use("/api/commandes", commandesRoute); // GET/POST/PATCH /api/commandes...

// 3. Ecouter sur un port
app.listen(3000, () => console.log("Serveur pret sur le port 3000"));

// 4. Gestion globale des erreurs
app.use((err, req, res, next) => {
  logger.error(`Erreur: ${err.message}`);
  res.status(500).json({ success: false, message: "Erreur serveur" });
});
```

### L'exécution des requêtes dans Express

Quand quelqu'un fait `POST /api/auth/login` :

```
Requete HTTP arrive
    │
    ▼
┌─────────────────────────┐
│  helmet()               │ ← Ajoute les en-tetes de securite
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│  cors()                 │ ← Verifie que l'origine est autorisee
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│  express.json()          │ ← Transforme le body JSON en objet JS
│  req.body = {            │
│    email: "x@y.com",     │
│    mot_de_passe: "abc"   │
│  }                       │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│  requestLogger          │ ← Genere un UUID, log la requete
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│  rateLimiter            │ ← Compte les tentatives (max 5/15min)
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│  validate(loginSchema)   │ ← Zod verifie le body
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│  router.post("/login")   │ ← Ta fonction : requete DB, JWT, reponse
└─────────────────────────┘
```

### Les routes — un fichier par domaine

Chaque fichier dans `routes/` gere un "domaine" metier :

```
routes/
├── auth.js          ← Login, inscription
├── commandes.js     ← Creer, lister, modifier les commandes
├── menu.js          ← Gerer les produits et categories
├── stock.js         ← Gerer le stock, ravitaillements
├── finances.js      ← Transactions, bilans, impots
├── personnel.js     ← Employes, salaires, presences
├── fournisseurs.js  ← Fournisseurs
├── statistiques.js  ← Tableaux de bord
├── tables.js        ← Tables de la salle
└── inventaire.js    ← Inventaires stock
```

**Exemple concret : comment on ecrit une route**

```javascript
// routes/auth.js
const express = require("express");
const router = express.Router();  // On cree un "mini express"
const pool = require("../config/db");  // La connexion a la DB

// GET /api/auth/test
router.get("/test", (req, res) => {
  res.json({ message: "Ca marche !" });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    // 1. Recuperer les donnees du body
    const { email, mot_de_passe } = req.body;

    // 2. Verifier que les champs sont presents
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis"
      });
    }

    // 3. Chercher l'utilisateur dans la DB
    const [rows] = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = ?",
      [email]  // ← "? " est remplace par "email" de facon securisee
    );

    // 4. Verifier le mot de passe
    const isMatch = await bcrypt.compare(mot_de_passe, rows[0].mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects"
      });
    }

    // 5. Creer un token JWT
    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Renvoyer le token + l'utilisateur (sans le mot de passe)
    const { mot_de_passe: _, ...safeUser } = rows[0];
    res.json({ success: true, user: safeUser, token });

  } catch (err) {
    // 7. Si quelque chose plante, on attrape l'erreur
    console.error("Erreur login:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;  // On "exporte" ce router pour server.js
```

### Pourquoi `router` et pas `app` directement ?

```javascript
// Dans server.js
app.use("/api/auth", authRoute);
```

`authRoute` est un `express.Router()`. C'est un "mini serveur" qui a ses propres routes. Quand tu dis `app.use("/api/auth", authRoute)`, Express dit : "Toutes les requetes qui commencent par `/api/auth`, je les passe a `authRoute`".

Donc dans `auth.js`, tu ecris `router.post("/login")` et Express comprend `POST /api/auth/login`.

**Avantage** : ton code est organise par fichier. `commandes.js` ne s'occupe que des commandes. Si tu cherches un bug sur les commandes, tu sais ou regarder.

### Le middleware — c'est quoi ?

Un middleware c'est une **fonction qui s'execute AVANT ta route**. C'est comme un filtre.

```javascript
// Exemple : middleware de verification du role
function requireRole(role) {
  return (req, res, next) => {
    // 1. Verifier que l'utilisateur est authentifie
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentification requise" });
    }
    // 2. Verifier son role
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Permission refusee" });
    }
    // 3. Si tout est bon, on passe a la suite
    next();
  };
}

// Utilisation :
app.use("/api/tables", requireRole("admin"), tablesRoute);
```

**L'ordre des middleware compte !** Si tu mets `requireRole` AVANT `authenticate`, `req.user` sera toujours `undefined`. Express execute les middleware dans l'ordre ou tu les declares.

```javascript
// ❌ MAUVAIS : authenticate n'est pas appele, req.user est vide
app.use("/api/tables", requireRole("admin"), authenticate, tablesRoute);

// ✅ BON : authenticate tourne en premier (via requireRole)
app.use("/api/tables", requireRole("admin"), tablesRoute);
// requireRole contient authenticate en interne
```

### Les 3 types de middleware dans cette app

| Middleware | Quand il s'execute | Ce qu'il fait |
|---|---|---|
| **Global** (`server.js`) | Sur TOUTES les requetes | Helmet, CORS, JSON parser, rate limit |
| **Validation** (`validate.js`) | Avant chaque POST/PUT/PATCH | Verifie le body avec Zod |
| **Auth** (`requireRole`) | Sur les routes protégées | Verifie le token JWT et le rôle |
| **Audit** (`auditLogger`) | Sur les ops sensibles | Log dans un fichier d'audit |

### La connexion MySQL — le `pool`

```javascript
// config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // ex: "localhost"
  user: process.env.DB_USER,        // ex: "root"
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,              // Max 10 connexions simultanees
  waitForConnections: true,         // Si les 10 sont occupees, on attend
});

module.exports = pool;
```

Un **pool** de connexions, c'est comme un restaurant avec 10 tables. Quand une requete arrive, elle prend une table. Quand elle a fini, elle libere la table. La prochaine requete peut utiliser cette table libre a nouveau.

**Pourquoi pas une seule connexion ?** Parce que si 5 clients font une requete en meme temps, la connexion unique serait un goulot d'etranglement. Le pool permet de traiter plusieurs requetes en parallele.

**Comment on l'utilise :**

```javascript
// Requete simple (le pool gere la connexion automatiquement)
const [rows] = await pool.query("SELECT * FROM utilisateurs");

// Transaction (plusieurs requetes qui doivent toutes reussir ou toutes echouer)
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  await conn.query("INSERT INTO ...");
  await conn.query("UPDATE ...");
  await conn.commit();  // Tout est valide
} catch (err) {
  await conn.rollback();  // Annule tout si une requete a echoue
} finally {
  conn.release();  // Libere la connexion dans le pool
}
```

**Transaction = atomicite**. Si tu crées une commande avec 3 articles, tu veux que les 3 articles soient inseres OU AUCUN (si la 3eme requete plante). Sans transaction, tu te retrouverais avec une commande incomplete.

### Queries parametrees — Anti-injection SQL

```javascript
// ❌ DANGEREUX — injection SQL possible
const query = "SELECT * FROM utilisateurs WHERE email = '" + email + "'";
// Si email = "'; DROP TABLE utilisateurs; --", adieu la table

// ✅ SECURISE — requete parametreee
const [rows] = await pool.query(
  "SELECT * FROM utilisateurs WHERE email = ?",
  [email]  // Le "?" est remplace de facon securisee
);
```

Les requetes parametrees : MySQL traite la variable comme une DONNEE, pas comme du CODE. Meme si quelqu'un envoie `'; DROP TABLE --`, MySQL cherche un email qui correspond litteralement a cette chaine, il ne l'execute pas.

### Validation avec Zod

Avant, on validait a la main :

```javascript
// ❌ Ad hoc, facile a oublier des cas
if (!nom || nom.trim() === "") return res.status(400).json(...);
if (!prix || typeof prix !== "number" || prix < 0) return res.status(400).json(...);
if (!type_poste || !["cuisine", "bar"].includes(type_poste)) return res.status(400).json(...);
```

Maintenant avec Zod :

```javascript
// ✅ Declaratif, reutilisable, messages d'erreur automatiques
const createProduitSchema = z.object({
  categorie_id: z.number().int().optional(),
  nom: z.string().min(1, "Nom du produit requis"),
  prix: z.number().min(0, "Prix invalide"),
  type_poste: z.enum(["cuisine", "bar"], { message: "Type invalide" }),
  dispo: z.boolean().optional(),
});

// Middleware generique (middleware/validate.js)
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Donnees invalides",
        errors: result.error.errors.map(e => e.message)
      });
    }
    next();  // Tout est valide, on continue
  };
}

// Utilisation
router.post("/produits", validate(createProduitSchema), async (req, res) => {
  // Ici, req.body est garanti valide
});
```

**Avantage** : tu definis la regle UNE FOIS, elle s'applique automatiquement. Si quelqu'un envoie un prix negatif, Zod le rejette AVANT que ta route ne s'execute.

### Authentification JWT (JSON Web Token)

**Le probleme** : HTTP est "sans etat" (stateless). Chaque requete est independante. Comment se souvenir qu'un utilisateur est connecte ?

**La solution JWT** :

```
1. Login :
   Client envoie → { email, mot_de_passe }
   Serveur verifie → OK
   Serveur cree un token signe → "eyJhbGciOiJIUzI1NiIs..."
   Serveur renvoie → { token: "eyJhbGci...", user: {...} }

2. Requete suivante :
   Client envoie → { Authorization: "Bearer eyJhbGci..." }
   Serveur verifie le token → OK, je connais cet utilisateur
   Serveur repond → les donnees demandees

3. 7 jours plus tard :
   Le token expire → le client doit se reconnecter
```

**Comment ca marche techniquement :**

```javascript
// Creation du token (login reussi)
const token = jwt.sign(
  { id: user.id, role: user.role, email: user.email },  // Les donnees
  process.env.JWT_SECRET,  // La cle secrete (personne ne doit la connaitre)
  { expiresIn: "7d" }       // Valide 7 jours
);

// Verification du token (requete suivante)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { id: 1, role: "admin", email: "admin@barresto.cm", iat: ..., exp: ... }
```

**Le token est signe, pas chiffre**. N'importe qui peut DECODER le token et voir `{ id: 1, role: "admin" }`. Mais SEUL le serveur qui connait le `JWT_SECRET` peut le SIGNER. Donc un utilisateur malin ne peut pas creer un faux token avec `role: "admin"`.

**Important :** ne mets JAMAIS le mot de passe dans le token. Le token voyage avec chaque requete — si quelqu'un l'intercepte, il a acces au compte. C'est pourquoi on met seulement l'ID et le role.

### Logging avec Winston

**Pourquoi pas `console.log` ?** Parce qu'en production :
- Les logs doivent etre persistes (pas juste affiches dans un terminal)
- On doit pouvoir filtrer par niveau (info, warn, error)
- Les logs sensibles doivent etre separes des logs normaux

```javascript
// config/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ]
});
```

**Niveaux de logs :**
- `error` : quelque chose a plante (unhandled exception, DB down)
- `warn` : quelque chose est anormal mais pas bloquant (token expire)
- `info` : evenement normal important (login reussi, commande creee)
- `http` : chaque requete recoit log (methode, URL, statut, temps)
- `audit` : operations financieres (paiement, modification de salaire)

### Gestion d'erreurs

**Regles :**
1. **Toujours** un `try/catch` autour des requetes DB
2. **Toujours** retourner `{ success: false, message: "..." }` au client
3. **Jamais** renvoyer `err.message` ou `err.stack` au client (fuite d'infos)
4. Utiliser les bons codes HTTP : `400` (mauvaise requete), `401` (non authentifie), `403` (non autorise), `404` (pas trouve), `500` (erreur serveur)

---

## 4. Le Frontend — React + Vite + Zustand

### Pourquoi React ?

React c'est une **bibliotheque d'interface**. Au lieu de manipuler le DOM a la main (`document.getElementById`, `element.innerHTML`), tu decris ce que tu veux voir et React met a jour le DOM pour toi.

```javascript
// ❌ Sans React
const div = document.getElementById("menu");
div.innerHTML = "";
produits.forEach(p => {
  div.innerHTML += `<div class="card"><h3>${p.nom}</h3><p>${p.prix}F</p></div>`;
});

// ✅ Avec React (declaratif)
function Menu({ produits }) {
  return (
    <div>
      {produits.map(p => (
        <div key={p.id} className="card">
          <h3>{p.nom}</h3>
          <p>{p.prix}F</p>
        </div>
      ))}
    </div>
  );
}
```

### Pourquoi Vite ?

Vite c'est le **bundler** — il prend tes fichiers `.jsx`, `.css`, etc. et les transforme en quelque chose que le navigateur comprend. Vite est rapide par rapport a Webpack/React-Scripts.

### Pourquoi Zustand (et pas Redux) ?

Zustand est un gestionnaire d'etat global ultra-simple. Redux demande 5 fichiers pour definir un store. Zustand demande 1 fichier.

```javascript
// store/appStore.js
import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Etat initial
  user: null,
  produits: [],
  tables: [],

  // Actions
  login: (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    set({ user: userData });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null });
  },

  fetchProduits: () =>
    apiFetch("/menu/produits").then((data) => {
      if (data.success) set({ produits: data.produits });
    }),
}));
```

**Comment on utilise le store dans un composant :**

```javascript
function MenuAdmin() {
  const produits = useAppStore((state) => state.produits);
  const fetchProduits = useAppStore((state) => state.fetchProduits);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  return (
    <div>
      {produits.map(p => <Card key={p.id} produit={p} />)}
    </div>
  );
}
```

### Les composants React — les briques de base

Un composant React est une fonction qui retourne du JSX (HTML ecrit en JavaScript) :

```javascript
// components/ui/badge.jsx
export function Badge({ variant, children }) {
  const colors = {
    "en attente": "bg-yellow-100 text-yellow-800",
    payee: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}
```

**Props** = les parametres d'un composant. `children` = le contenu entre les balises.

### Le routing — React Router

React Router gere la navigation sans recharger la page. C'est une SPA : une seule page HTML, mais React affiche différents composants selon l'URL.

```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={
          <RequireAuth role="admin"><AdminLayout /></RequireAuth>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="finances" element={<Finances />} />
        </Route>
        <Route path="/staff/*" element={
          <RequireAuth><StaffLayout /></RequireAuth>
        }>
          <Route index element={<StaffDashboard />} />
          <Route path="tables" element={<StaffTables />} />
          <Route path="kitchen" element={<StaffKitchen />} />
          <Route path="bar" element={<StaffBar />} />
          <Route path="commandes" element={<StaffCommandes />} />
        </Route>
        <Route path="/qr/:tableId" element={<ClientQRPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Le "Route Guard" (`RequireAuth`) :**

```javascript
function RequireAuth({ role, redirectPath = "/login", children }) {
  const user = useAppStore((state) => state.user);
  if (!user) return <Navigate to={redirectPath} replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/staff"} replace />;
  }
  return children;
}
```

### Les hooks React — les outils essentiels

**`useState` — memoriser une valeur**

```javascript
function Counter() {
  const [count, setCount] = useState(0);  // [valeur, fonction pour modifier]
  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

**Quand tu appelles `setCount`, React re-rend le composant avec la nouvelle valeur.**

**`useEffect` — executer des choses au montage du composant**

```javascript
function Dashboard() {
  const [stats, setStats] = useState(null);

  // Execute UNE SEULE FOIS au montage (grace au [])
  useEffect(() => {
    fetch("/api/stats/admin")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return <div>{stats ? <p>CA: {stats.ca}F</p> : <p>Chargement...</p>}</div>;
}
```

**Tableau de dependances :**
- `[]` = execute UNE SEULE FOIS au montage
- `[produits]` = execute au montage + chaque fois que `produits` change
- Pas de tableau = execute a CHAQUE rendu (piège !)

### Framer Motion — attention aux pièges

**`motion.div as={Link}` ne fonctionne PAS avec Framer Motion v12.**

```javascript
// ❌ Ne fonctionne pas — le bouton n'est pas cliquable
<motion.div as={Link} to="/page" whileHover={{ scale: 1.02 }}>
  ...
</motion.div>

// ✅ Solution : wrapper un <button> avec navigate()
const navigate = useNavigate();
<motion.button
  onClick={() => navigate("/page")}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  className="..."
>
  ...
</motion.button>
```

### Tailwind CSS — Pourquoi ?

Tailwind c'est du CSS via des classes utilitaires. Au lieu d'ecrire un fichier CSS separe, tu utilises des classes directement dans le JSX :

```jsx
<button className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm">
  Valider
</button>
```

---

## 5. La communication Frontend ↔ Backend

### La fonction `apiFetch`

```javascript
// store/appStore.js
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
    });
}
```

**Ce qui se passe :**
1. On recupere le token du localStorage (mis la lors du login)
2. On le met dans l'en-tete `Authorization: Bearer ...`
3. On fait la requete `fetch` vers le backend
4. On verifie `res.ok` (vrai si statut 200-299)
5. Si erreur HTTP, on retourne `{ success: false }` au lieu de planter

### Convention de reponse

Toutes les reponses API suivent le meme format :

```javascript
// Succes
{ success: true, donnees: ..., message: "..." }

// Erreur
{ success: false, message: "Description de l'erreur", errors: [...] }
```

---

## 6. La securite

### Le principe de defense en profondeur

```
Couche 1 : CORS → Seul ton frontend peut parler au backend
Couche 2 : Rate Limit → On ne peut pas spammer
Couche 3 : Authentication → Il faut etre connecte
Couche 4 : Authorization → Il faut avoir le bon role
Couche 5 : Validation → Les donnees doivent etre valides (Zod)
Couche 6 : Requetes parametrees → Pas d'injection SQL
Couche 7 : bcrypt → Les mots de passe sont hashes
Couche 8 : Helmet → Les en-tetes HTTP securises
```

### bcrypt — Hash des mots de passe

```javascript
// A la creation
const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

// A la connexion
const isMatch = await bcrypt.compare(mot_de_passe, hashedPassword);
```

**Pourquoi bcrypt et pas SHA256 ?** Parce que bcrypt est LENT exprtement. Si un pirate vole ta DB, il doit hasher des milliards de mots de passe pour les comparer.

### Le token JWT — ce qu'il faut savoir

**Ce que le token NE fait PAS :**
- Il ne peut PAS etre revoque (sauf avec une blacklist)
- Il n'empeche PAS quelqu'un qui a vole le token de l'utiliser
- Il n'est PAS chiffre (juste signe)

---

## 7. Les tests

### Pourquoi tester ?

Les tests verifient automatiquement que ton code fonctionne. Quand tu modifies quelque chose, tu lances les tests et tu sais immediatement si tu as casse quelque chose.

### Tests de middleware (fonctions pures)

```javascript
// tests/middleware/validate.test.js
describe("validate middleware", () => {
  it("devrait retourner 400 si le body est invalide", () => {
    const schema = z.object({ email: z.string().email() });
    const middleware = validate(schema);
    const req = { body: { email: "pas-un-email" } };
    const next = jest.fn();
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
```

**Les 3 fonctions mocks :**
- `jest.fn()` : cree une fonction espion
- `mockReturnThis()` : fait que `res.status()` retourne `res` (pour le chaining)
- `toHaveBeenCalledWith(400)` : verifie que la fonction a ete appelee avec 400

### Organisation des tests

```
backend/tests/
├── jest.setup.js
└── middleware/
    ├── validate.test.js
    ├── auth.test.js
    ├── requestLogger.test.js
    └── auditMiddleware.test.js
```

**29 tests**, tous passent. Lance `npm test` dans le dossier backend.

---

## 8. Guide de developpement — pages, flux et erreurs courantes

### Structure des pages Frontend

| Page | Chemin | Role | Fetch requis |
|---|---|---|---|
| Login | `/login` | Tout le monde | Aucun |
| Admin Dashboard | `/admin` | Admin | `fetchStats()`, `fetchRevenus()`, `fetchCommandesHeure()` |
| Admin Finances | `/admin/finances` | Admin | `fetchRevenus()`, `fetchImpots()`, `fetchStats()` |
| Admin Personnel | `/admin/personnel` | Admin | `fetchPersonnel()`, `fetchSalaires()` |
| Admin Stock | `/admin/stock` | Admin | `fetchStock()`, `fetchAlertesStock()`, `fetchRavitaillements()`, `fetchFournisseurs()` |
| Admin Menu | `/admin/menu` | Admin | `fetchProduits()` |
| Admin QR Codes | `/admin/qrcodes` | Admin | `fetchTables()` |
| Staff Dashboard | `/staff` | Staff | `fetchCommandesEnCours()`, `fetchStatsJournalier()`, `fetchTables()` |
| Staff Tables | `/staff/tables` | Staff | `fetchTables()` |
| Staff Commandes | `/staff/commandes` | Staff | `fetchCommandesEnCours()`, `fetchTables()`, **`fetchProduits()`** |
| Staff Kitchen | `/staff/kitchen` | Staff | `fetchCommandesEnCours()` |
| Staff Bar | `/staff/bar` | Staff | `fetchCommandesEnCours()` |
| Client QR | `/qr/:tableId` | Client (no auth) | `fetch(/api/menu/produits)` |

### Les erreurs courantes qu'on a corrigees

**Erreur 1 : Page blanche apres modification d'un fichier**
- **Cause** : Un composant React plante quand un import est manquant ou faux
- **Exemple** : `UtensilsCrossed` utilisé dans le JSX mais pas importe dans le `import { ... } from "lucide-react"`
- **Solution** : Verifier que TOUT ce qui est utilise dans le JSX est bien importe
- **Comment deboguer** : Ouvrir F12 → Console du navigateur, l'erreur dit exactement ce qui manque

**Erreur 2 : Liste de produits vide dans la page nouvelles commandes**
- **Cause** : `fetchProduits()` n'était JAMAIS appele dans `StaffCommandes`
- **Solution** : Ajouter `fetchProduits()` dans le `useEffect` du composant
- **Leçon** : Chaque page doit fetcher ses propres donnees. Ne suppose pas qu'un autre composant l'a fait.

**Erreur 3 : Boutons "Acces rapide" non-cliquables**
- **Cause** : `motion.div as={Link}` ne fonctionne pas avec Framer Motion v12
- **Solution** : Remplacer par `<motion.button onClick={() => navigate("/route")} />`
- **Leçon** : Les versions de bibliotheques changent, les APIs changent

**Erreur 4 : Routes menu bloquées (403 pour tout le monde)**
- **Cause** : `app.use("/api/menu", requireRole("admin"), menuRoute)` protegeait MEME les GET
- **Solution** : Middleware conditionnel qui verifie `req.method` — GET/HEAD public, POST/PUT/DELETE admin
- **Leçon** : `app.use(route)` applique le middleware a TOUTES les methodes HTTP

**Erreur 5 : API 500 sur toutes les routes**
- **Symptome** : Console navigateur affiche `Failed to load resource: the server responded with a status of 500` + `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **Cause** : Le serveur backend (`backend/server.js`) n'est pas demarre ou a plante. Le frontend recoit du HTML au lieu du JSON attendu
- **Comment verifier** : `curl http://localhost:3000/api/health` — si ca ne repond pas `{"status":"ok"}`, le backend ne tourne pas
- **Solution** : `cd backend && node server.js` — en developpement, le backend NE redemarre PAS automatiquement
- **Leçon** : Si toutes les requetes API echouent en meme temps, le probleme est le serveur, pas le code

**Erreur 6 : `ReferenceError: X is not defined` dans un composant React**
- **Symptome** : `[vite] Failed to reload /src/pages/XXX.jsx` + `Uncaught ReferenceError: X is not defined`
- **Cause** : Vite HMR garde en cache une ancienne version du fichier meme apres correction
- **Solution** : Hard refresh navigateur (`Ctrl+Shift+R`) ou redemarrer Vite (`Ctrl+C` puis `npm run dev`)
- **Leçon** : Vite HMR peut garder un etat incoherent — le hard refresh resout 90% des "bugs fantomes"

**Erreur 7 : Le backend ne demarre pas — `Cannot find module`**
- **Symptome** : `Error: Cannot find module 'backend/app.js'`
- **Cause** : Le point d'entree s'appelle `server.js`, PAS `app.js`
- **Solution** : `cd backend && node server.js`
- **Leçon** : Verifier le nom du fichier avec `ls` ou `dir` avant de le lancer

**Important** : Apres avoir modifie le code backend, il faut tuer l'ancien process (`taskkill //F //PID <pid>` sous Windows) puis relancer `node server.js`, sinon les changements ne sont pas pris en compte.

### Fonctionnalites ajoutees depuis la derniere mise a jour

**Mot de passe employe et premier login :**
- L'admin peut definir un mot de passe lors de l'ajout d'un employe (optionnel, sinon `{prenom}123!`)
- Au premier login, l'employe est force de changer son mot de passe via la page `/change-password`
- La colonne `first_login` a ete ajoutee en DB (TRUE = premiere connexion)
- Backend : route `PATCH /api/auth/change-password` (dans `backend/routes/auth.js`)
- Frontend : page `ChangePassword.jsx` avec formulaire de modification
- Route register cree aussi automatiquement le salaire et la presence du jour

**Salaires employes :**
- L'onglet **Salaires** dans Personnel affiche les salaires du mois courant (generes auto si inexistants)
- Le montant est **editable inline** — clique sur le chiffre, modifie, appuie Entrée ou clique ailleurs
- Montants par defaut selon le poste : Gerant 500k, Cuisinier 300k, Barman 250k, Autres 200k
- Backend : route `GET /api/personnel/salaires` genere automatiquement + `PATCH /api/personnel/salaires/:id` pour modifier
- Quand on ajoute un employe, le salaire est cree directement avec la valeur du formulaire

**Modification employe :**
- Cliquer sur une carte employe ouvre sa fiche en lecture seule + bouton **Modifier**
- Le formulaire de modification change nom, prenom, email, telephone, poste et statut actif/inactif
- Backend : deja existant `PUT /api/personnel/:id`

**Indicateur de présence en ligne :**
- Un petit **point vert** apparaît sur la carte d'un employe dans Personnel quand il est connecte
- Fonctionne via un **heartbeat** : chaque utilisateur envoie un signal toutes les 10s → `last_seen` mis a jour en DB
- Si pas de heartbeat depuis **15 secondes** → le point disparait (utilisateur deconnecte, navigateur ferme, etc)
- Backend : colonne `last_seen` dans table `utilisateurs` + route `POST /api/auth/heartbeat` (exclue du rate limiter)
- Frontend : `App.jsx` lance le heartbeat quand l'utilisateur est connecte, `Personnel.jsx` rafraichit la liste toutes les 5s
- Le point est aussi visible dans la sidebar de l'admin a cote de son nom

### Regles d'or pour developper

1. **Chaque page fetch ses propres donnees** — Ne suppose pas que quelqu'un d'autre l'a fait
2. **Toujours verifier les imports** — Un import manquant = page blanche
3. **Toujours un loading state** — Pendant que les donnees chargent, affiche quelque chose
4. **Toujours gerer les erreurs fetch** — `res.ok` avant `res.json()`
5. **Toujours verifier que le backend tourne** — `curl http://localhost:3000/api/health` — si toutes les requetes API echouent (500), le backend n'est pas demarre
6. **Point d'entree backend = `server.js`** — Pas `app.js` : `cd backend && node server.js`
7. **Hard refresh si bug fantome** — `Ctrl+Shift+R` dans le navigateur pour vider le cache Vite HMR
8. **Toujours tester avec le navigateur** — "Ca compile" ne veut pas dire "Ca marche"
9. **Le rate limiter bloque les requetes** — Le heartbeat est exclu (`server.js`), mais si tu as trop de 429, redemarre le backend
10. **Apres chaque modification backend, il faut tuer l'ancien process et relancer**

### Flux de donnees — du clic a la base de donnees


1. Utilisateur clique "Nouvelle commande"
   → Le composant StaffCommandes.jsx met a jour son etat local (useState)

2. Utilisateur ajoute des produits au panier
   → setCartItems([...cartItems, nouveauProduit])
   → React re-rend le panier

3. Utilisateur clique "Valider"
   → Le composant appelle addCommande(cmdData)

4. addCommande est dans le Zustand store
   → Il fait fetch(...) vers POST /api/commandes
   → Il envoie le panier en JSON

5. Le backend Express recoit la requete
   → validate() verifie avec Zod
   → requireRole() verifie le token
   → La route create une commande dans MySQL (avec transaction)
   → Renvoie { success: true, commande: {...} }

6. Le frontend recoit la reponse
   → fetchCommandesEnCours() est appele pour rafraichir la liste
   → set({ commandesEnCours: [...nouvelles données] })
   → React re-rend la liste des commandes

7. L'utilisateur voit la nouvelle commande
```

### Regles d'or pour developper

1. **Chaque page fetch ses propres donnees** — Ne suppose pas que quelqu'un d'autre l'a fait
2. **Toujours verifier les imports** — Un import manquant = page blanche
3. **Toujours un loading state** — Pendant que les donnees chargent, affiche quelque chose
4. **Toujours gerer les erreurs fetch** — `res.ok` avant `res.json()`
5. **Toujours relancer le serveur apres une modification** — Le code modifie n'est pas applique automatiquement
6. **Toujours tester avec le navigateur** — "Ca compile" ne veut pas dire "Ca marche"

---

## 9. Le deploiement — Cloudflare Pages + VPS

### Architecture de deploiement

```
                    Internet
                        │
                 ┌──────┴──────┐
                 │ Cloudflare  │ ← Cache, DNS, HTTPS gratuit
                 │  Pages CDN  │
                 └──────┬──────┘
                        │
                 ┌──────┴──────┐
                 │   VPS (Linux)│ ← Backend Node.js + MySQL
                 │             │
                 │  Express:3000│
                 │  MySQL:3306 │
                 └─────────────┘
```

### Etape 1 : Frontend sur Cloudflare Pages (gratuit)

Cloudflare Pages heberge tes fichiers statiques React avec HTTPS gratuit et CDN mondial.

**Ce qu'il te faut :**
- Un compte Cloudflare (gratuit)
- Ton code sur GitHub/GitLab

**Configuration :**

1. Pousse ton code sur GitHub :
```bash
git init
git add .
git commit -m "BarResto initial"
git remote add origin https://github.com/ton-user/bar-restaurant.git
git push -u origin main
```

2. Va sur https://pages.cloudflare.com/ → Connect → Choisis ton repo GitHub

3. Config du build :
```
Framework preset :  React (Vite)
Build command  :  npm run build
Build directory : frontend/dist
```

4. Variables d'environnement dans Cloudflare Pages → Settings → Environment Variables :
```
VITE_API_URL=https://api.ton-domaine.cm/api
```
(Ce sera l'URL de ton backend, voir etape 2)

5. Cloudflare construit et deploye automatiquement. Chaque push sur `main` = nouveau deploiement.

**Pour deployer manuellement (sans Git) :**

```bash
# Installer Wrangler CLI
npm install -g wrangler

# Authentifier
wrangler login

# Build le frontend
cd frontend
npm install
npm run build

# Deployer
wrangler pages deploy dist/ --project-name=barresto-frontend
```

### Etape 2 : Backend sur un VPS

**Pourquoi un VPS ?** Parce que ton backend tourne un serveur Node.js qui doit ecouter en permanence. Cloudflare Pages ne peut pas heberger de serveur — seulement des fichiers statiques.

**VPS recommande :**
- **Render.com** (gratuit pour les petits projets, mais dort apres 15min d'inactivite)
- **Railway.app** ($5/mois, fiable)
- **DigitalOcean** ($4/mois droplet)
- **OVH VPS** (~3€/mois)

#### Exemple avec un VPS Ubuntu (OVH/DigitalOcean)

**1. Preparer le serveur :**

```bash
# SSH sur ton VPS
ssh root@ton-ip

# Update systeme
apt update && apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installer MySQL
apt install -y mysql-server
mysql_secure_installation

# Installer PM2 (garde le serveur en vie)
npm install -g pm2

# Installer Nginx (reverse proxy + HTTPS)
apt install -y nginx certbot python3-certbot-nginx
```

**2. Creer la base de donnees :**

```bash
mysql -u root -p
```
```sql
CREATE DATABASE barrelle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'barresto'@'localhost' IDENTIFIED BY 'un_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON barrelle_db.* TO 'barresto'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Importer le schema :
```bash
mysql -u barrelle_db < backend/database.sql
```

**3. Deployer le backend :**

```bash
# Creer le dossier de l'app
mkdir -p /var/www/barresto
cd /var/www/barresto

# Copier ton backend (ou git clone)
git clone https://github.com/ton-user/bar-restaurant.git .

# Installer les dependances
cd backend
npm install --production

# Creer le .env de production
cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=barresto
DB_PASSWORD=un_mot_de_passe_fort
DB_NAME=barrelle_db
JWT_SECRET=une_chaine_aleatoire_de_64_caracteres_minimum
ALLOWED_ORIGINS=https://barresto.pages.dev
NODE_ENV=production
EOF

# Lancer avec PM2
pm2 start server.js --name barrelle-api
pm2 save
pm2 startup
```

**4. Configurer Nginx (reverse proxy + HTTPS) :**

```bash
cat > /etc/nginx/sites-available/barresto <