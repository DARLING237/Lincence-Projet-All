/**
 * BarResto - Validation Middleware
 * Wrapper Zod pour Express
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      // Parser le body (ou query ou params selon le schema)
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Erreur de validation",
          errors,
        });
      }

      req.validated = result.data;
      next();
    } catch (err) {
      console.error("Validation error:", err);
      res.status(500).json({ success: false, message: "Erreur interne de validation" });
    }
  };
}

module.exports = validate;