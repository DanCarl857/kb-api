import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class DuplicateRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  newArticleId: number;

  @Column()
  existingArticleId: number;

  @Column()
  tenantId: number;

  @Column()
  reason: string;

  @Column()
  timestamp: string;
}
