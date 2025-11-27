import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { swaggerSpec } from "./swaggerSpec";

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
