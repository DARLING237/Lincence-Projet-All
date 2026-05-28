const winston = require("winston");

// 1. Définir le format de base des logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 2. Initialiser les transports avec uniquement la Console (compatible Vercel)
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ timestamp, level, message, stack }) => 
          `[${timestamp}] ${level}: ${stack || message}`
      )
    )
  })
];

// 3. N'ajouter la rotation de fichiers QUE si on n'est PAS sur Vercel (en local)
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  try {
    const DailyRotateFile = require("winston-daily-rotate-file");
    
    transports.push(
      new DailyRotateFile({
        filename: "logs/application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
      })
    );
    
    console.log("📁 Logger local activé : Écriture dans le dossier 'logs/' autorisée.");
  } catch (error) {
    console.warn("⚠️ Impossible de charger winston-daily-rotate-file en local :", error.message);
  }
} else {
  console.log("☁️ Environnement Vercel détecté : Mode de journalisation Serverless (Console uniquement).");
}

// 4. Créer et exporter le logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: transports,
});

module.exports = logger;