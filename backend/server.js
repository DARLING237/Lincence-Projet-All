require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

// --- CORS ---
const allowedOrigins = [
  "https://lincence-projet.vercel.app",
  "http://localhost:5173",
  "https://lincence-projet-15eo76aj5-darlingamza-gmailcoms-projects.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// --- Middlewares standards ---
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === "OPTIONS",
});
app.use(limiter);

// Logging (utile pour debug Vercel)
app.use((req, res, next) => {
  console.log(`📢 ${req.method} ${req.url}`);
  next();
});

const authRouter = require("./routes/auth");

// --- Routes principales ---
app.get("/", (req, res) => {
  res.json({ message: "Backend BarResto actif", environment: process.env.NODE_ENV });
});

// Auth routes
app.use("/api/auth", authRouter);
app.use("/auth", authRouter);

// Heartbeat (GET et POST)
app.get("/api/auth/heartbeat", (req, res) => {
  res.json({ success: true, message: "Heartbeat OK (GET)" });
});
app.post("/api/auth/heartbeat", (req, res) => {
  res.json({ success: true, message: "Heartbeat OK (POST)" });
});

// Tables
app.get("/api/tables", (req, res) => {
  // À remplacer par la vraie logique (ex: récupération depuis MySQL)
  res.json({ success: true, tables: [] });
});

// Statistiques
app.get("/api/stats/rapport", (req, res) => {
  const { period, date } = req.query;
  // Exemple : retourner des données factices
  res.json({
    success: true,
    period,
    date,
    chiffreAffaires: 1250.00,
    nbCommandes: 42,
    message: "Rapport généré (version de démonstration)"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Historique des connexions (admin)
app.get("/api/connection-history/admin", (req, res) => {
  // À implémenter avec votre logique (ex: récupération depuis MySQL)
  res.json({
    success: true,
    data: [
      // tableau d'historique
    ],
    message: "Historique des connexions - à compléter"
  });
});
// --- 404 pour toutes les routes non définies ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route non trouvée : ${req.method} ${req.url}` });
});

// --- Gestion des erreurs serveur ---
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur :", err);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// --- Export pour Vercel ---
module.exports = app;

// Démarrage local (hors production)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Local : http://localhost:${PORT}`));
}