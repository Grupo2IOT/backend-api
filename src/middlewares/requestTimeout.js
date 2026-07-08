module.exports = (timeoutMs = 10000) => (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      return res.status(408).json({
        success: false,
        message: "Request timeout",
        errors: [],
      });
    }
  }, timeoutMs);

  res.on("finish", () => clearTimeout(timer));
  res.on("close", () => clearTimeout(timer));
  next();
};
