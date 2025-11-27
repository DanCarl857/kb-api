import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { KnowledgeArticle } from "./KnowledgeArticle";

@Entity()
@Unique(["name"])
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  primaryLocale: string;

  @OneToMany(() => KnowledgeArticle, (article) => article.tenant)
  articles: KnowledgeArticle[];
}
