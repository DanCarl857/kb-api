import express from "express";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./data-source";

import tenantRoutes from "./routes/tenants.route";
import articleRoutes from "./routes/articles.route";
import topicRoutes from "./routes/topics.route";
import aliasRoutes from "./routes/aliases.route";
import duplicateRoutes from "./routes/duplicate.route";

import { setupSwagger } from "./swagger";
import logger from "./logger";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
})

/* API v1 routes */
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/aliases", aliasRoutes);
app.use("/api/v1", duplicateRoutes)

setupSwagger(app);

/* Start server */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Error processing request: %s %s - %O", req.method, req.url, err);
  res.status(500).json({ message: "Internal Server Error" });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      logger.info("Server running at http://localhost:3000");
      logger.info("Docs: http://localhost:3000/docs");
    });
  })
  .catch((err) => {
    logger.error("Error initializing database: %O", err);
  });