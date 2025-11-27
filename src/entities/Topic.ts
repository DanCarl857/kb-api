import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { KnowledgeArticle } from "./KnowledgeArticle";

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string;

  @ManyToMany(() => KnowledgeArticle, (article) => article.topics)
  articles: KnowledgeArticle[];
}
