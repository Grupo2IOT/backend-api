const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const routes = require("./routes");
const swaggerSpec = require("./swagger/swagger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin, credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => res.json({ success: true, message: "AquaEdge Backend API is running", data: { layer: "Information Integration Layer" } }));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
