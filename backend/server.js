require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// --- CORS manuel ---
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://lincence-projet.vercel.app",
    "http://localhost:5173",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

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

// --- Routes principales ---
app.get("/", (req, res) => {
  res.json({ message: "Backend BarResto actif", environment: process.env.NODE_ENV });
});

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