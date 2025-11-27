import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Tenant } from "./Tenant";
import { Alias } from "./Alias";
import { Topic } from "./Topic";

@Entity()
export class KnowledgeArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  body: string;

  @Column()
  publishedYear: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.articles, { onDelete: "CASCADE" })
  tenant: Tenant;

  @OneToMany(() => Alias, (alias) => alias.article, { cascade: true, eager: true })
  aliases: Alias[];

  @ManyToMany(() => Topic, (topic) => topic.articles, { cascade: true })
  @JoinTable()
  topics: Topic[];
}
