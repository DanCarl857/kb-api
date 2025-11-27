import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { KnowledgeArticle } from "./KnowledgeArticle";

@Entity()
export class Alias {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => KnowledgeArticle, (article) => article.aliases, {
    onDelete: "CASCADE",
  })
  article: KnowledgeArticle;
}
