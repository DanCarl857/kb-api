export const QUEUES = {
  DUPLICATE_WARNING: "duplicate_article_warning",
} as const;

export interface DuplicateArticleWarningEvent {
  newArticleId: number;
  existingArticleId: number;
  tenantId: number;
  reason: "title_match" | "alias_match";
  timestamp: string;
}