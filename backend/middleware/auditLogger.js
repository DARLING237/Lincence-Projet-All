/**
 * BarResto - Audit Logger Middleware
 * Enregistre les actions des utilisateurs pour l'audit
 */
const { auditLogger } = require("../config/logger");

/**
 * Factory de middleware d'audit - enregistre chaque requête
 * @param {Object} options - Options (action, description, etc.)
 */
function auditMiddleware(options = {}) {
  return function audit(req, res, next) {
    const start = Date.now();

    // Capturer la réponse
    const originalSend = res.json;
    res.json = function (body) {
      const duration = Date.now() - start;

      auditLogger.info("REQUEST", {
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id || "anonymous",
        role: req.user?.role || "none",
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
        userAgent: req.headers["user-agent"],
        success: body?.success ?? true,
        action: options.action || null,
        description: options.description || null,
      });

      return originalSend.call(this, body);
    };

    next();
  };
}

module.exports = auditMiddleware;