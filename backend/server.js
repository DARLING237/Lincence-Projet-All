/**
 * BarResto - Serveur principal
 * Application Express pour la gestion de bar/restaurant
 */
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const { logger } = require("./config/logger");
const { createConnectionSession, closeConnectionSession } = require("./middleware/connectionTracker");

// ── Créer les dossiers nécessaires ──
const uploadsDir = path.join(__dirname, "uploads", "menu");
const logsDir = path.join(__dirname, "logs");
const backupsDir = path.join(__dirname, "backups");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

// ── Initialisation Express ──
const app = express();
app.set('trust proxy', 1); 
const PORT = process.env.PORT || 3000;

// ── Middlewares globaux ──
app.use(helmet({ crossOriginResourcePolicy: false }));
// Configuration CORS sécurisée
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"] 
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({ 
  origin: function (origin, callback) {
    // Autorise l'accès si pas d'origine (ex: Postman), si dans la liste, ou si en dev
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      console.warn(`CORS bloqué pour l'origine : ${origin}`);
      callback(new Error("Accès bloqué par CORS"));
    }
  }, 
  credentials: true 
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));



// ... reste de ton code (cors, routes, etc.)
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// ── Logger des requêtes ──
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes API ──
app.use("/api/auth", require("./routes/auth"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/commandes", require("./routes/commandes"));
app.use("/api/tables", require("./routes/tables"));
app.use("/api/personnel", require("./routes/personnel"));
app.use("/api/stock", require("./routes/stock"));
app.use("/api/fournisseurs", require("./routes/fournisseurs"));
app.use("/api/finances", require("./routes/finances"));
app.use("/api/stats", require("./routes/statistiques"));
app.use("/api/connection-history", require("./routes/connectionHistory"));

// ── Route de santé ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Gestion des fichiers statiques (uploads) ──
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Frontend (production) ──
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

// ── Gestion des erreurs 404 ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ── Gestion des erreurs globales ──
app.use((err, req, res, _next) => {
  console.error("❌ Erreur non gérée:", err);
  logger.error("Unhandled error", { error: err.message, stack: err.stack });

  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: "Fichier trop volumineux ou invalide" });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Erreur interne du serveur" : err.message,
  });
});

// ── Middleware de suivi de connexion (après authentification) ──
// Intercepter la déconnexion pour fermer la session
app.use(async (req, res, next) => {
  // Pour les routes nécessitant un suivi
  if (req.user && req.path.startsWith("/api")) {
    const sessionId = req.headers["x-session-id"] || req.headers["session-id"];
    if (sessionId) {
      // Mettre à jour last_seen
      await req.db
        ?.query("UPDATE utilisateurs SET last_seen = NOW() WHERE id = ?", [req.user.id])
        .catch(() => {});
    }
  }
  next();
});

// ── Démarrage du serveur ──
const server = app.listen(PORT, () => {
  logger.info(`🚀 Serveur BarResto démarré sur le port ${PORT}`);
  logger.info(`📍 Mode: ${process.env.NODE_ENV || "development"}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
});

// ── Gestion de l'arrêt propre ──
process.on("SIGTERM", () => {
  logger.info("SIGTERM reçu — fermeture du serveur...");
  server.close(() => {
    logger.info("Serveur fermé proprement");
    process.exit(0);
  });
});


process.on("SIGINT", () => {
  logger.info("SIGINT reçu — fermeture du serveur...");
  server.close(() => {
    logger.info("Serveur fermé proprement");
    process.exit(0);
  });
});

module.exports = { app, server };