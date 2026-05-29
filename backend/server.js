require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { ensureRuntimeSchema } = require("./services/schemaMigrations");

const app = express();

const schemaReady = ensureRuntimeSchema().catch((err) => {
  console.error("Erreur migration schema runtime:", err);
});

// --- 1. CONFIGURATION CORS UNIQUE ET ROBUSTE ---
const allowedOrigins = [
  "https://lincence-projet.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Autorise les requêtes sans origine (comme Postman ou les requêtes internes)
    if (!origin) return callback(null, true);
    
    // Autorise localhost, le domaine principal et TOUS les sous-domaines Vercel (.vercel.app)
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Bloqué par la politique CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 204 // Assure une réponse propre aux requêtes Preflight
};

// Application globale du middleware CORS (gère automatiquement GET, POST, OPTIONS, etc.)
app.use(cors(corsOptions));

// --- 2. CONFIGURATION DE LA SÉCURITÉ & MIDDLEWARES ---
app.set("trust proxy", 1);

// Configuration de Helmet adaptée aux API REST qui partagent des ressources (CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Limiteur de requêtes (Rate Limiter)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Augmenté de 100 à 500 requêtes par fenêtre (pour éviter le 429)
  skip: (req) => req.method === "OPTIONS", // Ne pas limiter les requêtes Preflight
  standardHeaders: true, // Retourner les limites en headers RateLimit-*
  legacyHeaders: false // Désactiver les headers X-RateLimit-*
});
app.use(limiter);

app.use(async (req, res, next) => {
  if (req.path === "/api/health" || req.path === "/") return next();

  try {
    await schemaReady;
    next();
  } catch (err) {
    next(err);
  }
});

// Logger simple pour le débogage dans le tableau de bord Vercel
app.use((req, res, next) => {
  console.log(`📢 ${req.method} ${req.url} - Origin: ${req.headers.origin || "none"}`);
  next();
});

// --- 3. IMPORT DES ROUTES ---
const authRouter = require("./routes/auth");
const statistiquesRouter = require("./routes/statistiques");
const commandesRouter = require("./routes/commandes");
const connectionHistoryRouter = require("./routes/connectionHistory");
const financesRouter = require("./routes/finances");
const fournisseursRouter = require("./routes/fournisseurs");
const inventaireRouter = require("./routes/inventaire");
const menuRouter = require("./routes/menu");
const personnelRouter = require("./routes/personnel");
const stockRouter = require("./routes/stock");
const tablesRouter = require("./routes/tables");

// --- 4. ROUTES DE BASE & HEALTH CHECKS ---
app.get("/", (req, res) => {
  res.json({ message: "Backend BeerStock actif", environment: process.env.NODE_ENV });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/auth/heartbeat", (req, res) => {
  res.json({ success: true, message: "Heartbeat OK (GET)" });
});


// --- 5. ENREGISTREMENT DES ROUTES API ---
app.use("/api/auth", authRouter);
app.use("/auth", authRouter); // Double routage conservé pour la compatibilité frontend
app.use("/api/stats", statistiquesRouter);
app.use("/api/commandes", commandesRouter);
app.use("/api/connection-history", connectionHistoryRouter);
app.use("/api/finances", financesRouter);
app.use("/api/fournisseurs", fournisseursRouter);
app.use("/api/inventaire", inventaireRouter);
app.use("/api/menu", menuRouter);
app.use("/api/personnel", personnelRouter);
app.use("/api/stock", stockRouter);
app.use("/api/tables", tablesRouter);

// --- 6. GESTION DES ROUTES NON TROUVÉES (404) ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route non trouvée : ${req.method} ${req.url}` });
});

// --- 7. GESTION GLOBALE DES ERREURS SERVEUR (500) ---
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur générale :", err);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// --- 8. EXPORT POUR VERCEL ---
module.exports = app;

// Démarrage de l'écoute uniquement en mode développement local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Serveur local lancé sur : http://localhost:${PORT}`));
}
