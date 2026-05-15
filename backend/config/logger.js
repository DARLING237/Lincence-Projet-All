/**
 * BarResto - Logger
 * Configuration Winston avec rotation quotidienne
 */
const winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format personnalisé
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const prefix =
    level === "error"
      ? "🔴"
      : level === "warn"
      ? "🟡"
      : level === "info"
      ? "🔵"
      : "⚪";
  return `${prefix} [${timestamp}] ${level.toUpperCase()}: ${message} ${stack || ""}`;
});

// Transports
const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  }),
  new winston.transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
  }),
  new winston.transports.DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
  }),
];

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" })),
  transports,
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "logs/exceptions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),
  ],
});

// Logger pour l'audit
const auditLogger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    }),
    new winston.transports.File({
      filename: "logs/audit.log",
      maxSize: "10m",
      maxFiles: 5,
    }),
  ],
});

module.exports = { logger, auditLogger };