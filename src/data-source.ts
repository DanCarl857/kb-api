import "reflect-metadata";
import { DataSource } from "typeorm";
import { Tenant } from "./entities/Tenant";
import { KnowledgeArticle } from "./entities/KnowledgeArticle";
import { Alias } from "./entities/Alias";
import { Topic } from "./entities/Topic";
import { DuplicateRecord } from "./entities/DuplicateRecord";

const DATABASE_PATH = process.env.DATABASE_PATH || "db.sqlite";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  synchronize: true, // Use migrations for production
  entities: [Tenant, KnowledgeArticle, Alias, Topic, DuplicateRecord],
});
