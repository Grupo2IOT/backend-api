const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/roles", require("./roleRoutes"));
router.use("/plots", require("./plotRoutes"));
router.use("/devices", require("./deviceRoutes"));
router.use("/telemetry", require("./telemetryRoutes"));
router.use("/commands", require("./commandRoutes"));
router.use("/irrigation-rules", require("./irrigationRuleRoutes"));
router.use("/irrigation-events", require("./irrigationEventRoutes"));
router.use("/alerts", require("./alertRoutes"));
router.use("/reports", require("./reportRoutes"));
router.use("/audit-logs", require("./auditRoutes"));

module.exports = router;
