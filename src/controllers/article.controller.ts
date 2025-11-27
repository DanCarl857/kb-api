import { Request, Response } from "express";
import { KnowledgeArticle as Article } from "../entities/KnowledgeArticle";
import { Tenant } from "../entities/Tenant";
import { Topic } from "../entities/Topic";
import logger from "../logger";
import { AppDataSource } from "../data-source";
import { Alias } from "../entities/Alias";
import { emitDuplicateWarning } from "../events/producers/duplicateProducer";

const articleRepo = AppDataSource.getRepository(Article);
const tenantRepo = AppDataSource.getRepository(Tenant);
const topicRepo = AppDataSource.getRepository(Topic);

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, body, publishedYear, tenantId, aliases, topicIds } = req.body;

    if (!title || !body || !publishedYear || !tenantId)
        return res.status(400).json({ error: "Missing required fields" });

    const tenant = await tenantRepo.findOneBy({ id: tenantId });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const existingArticles = await articleRepo.find({
      where: { tenant: { id: tenantId } },
      relations: ["aliases"],
    })

    for (const existing of existingArticles) {
      if (existing.title.toLowerCase() === title.toLowerCase()) {
        await emitDuplicateWarning({
          newArticleId: 0,
          existingArticleId: existing.id,
          tenantId,
          reason: "title_match",
          timestamp: new Date().toISOString(),
        });
      }

      for (const alias of existing.aliases) {
        if (alias.text.toLowerCase() === title.toLowerCase()) {
          await emitDuplicateWarning({
            newArticleId: 0,
            existingArticleId: existing.id,
            tenantId,
            reason: "alias_match",
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    const article = new Article();
    article.title = title;
    article.body = body;
    article.publishedYear = publishedYear;
    article.tenant = tenant;

    if (Array.isArray(topicIds) && topicIds.length > 0) {
      article.topics = await topicRepo.findByIds(topicIds);
    } else {
      article.topics = [];
    }

    if (Array.isArray(aliases) && aliases.length > 0) {
      article.aliases = aliases.map((a: any) => {
        const alias = new Alias();
        // support string or object { text: '...' }
        alias.text = typeof a === "string" ? a : (a && a.text) ? a.text : String(a);
        return alias;
      });
    } else {
      article.aliases = [];
    }

    await articleRepo.save(article);

    const saved = await articleRepo.findOne({
      where: { id: article.id },
      relations: ["tenant", "topics", "aliases"],
    });

    logger.info(`Article created: ${title}`);

    res.json(saved);
  } catch (err: any) {
    logger.error(`Failed to create article: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listArticles = async (req: Request, res: Response) => {
  try {
    const { q, tenantId, year } = req.query;

    const query = articleRepo.createQueryBuilder("article")
      .leftJoinAndSelect("article.tenant", "tenant")
      .leftJoinAndSelect("article.topics", "topics")
      .leftJoinAndSelect("article.aliases", "aliases");

    if (q) query.andWhere("article.title LIKE :q OR aliases.text LIKE :q", { q: `%${q}%` });
    if (tenantId) query.andWhere("article.tenantId = :tenantId", { tenantId });
    if (year) query.andWhere("article.publishedYear = :year", { year });

    const articles = await query.getMany();
    res.json(articles);
  } catch (err: any) {
    logger.error(`Failed to list articles: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const article = await articleRepo.findOne({ where: { id: Number(req.params.id) }, relations: ["tenant", "topics", "aliases"] });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err: any) {
    logger.error(`Failed to get article: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body, publishedYear, tenantId, aliases, topicIds } = req.body;

    const article = await articleRepo.findOne({ where: { id: Number(id) }, relations: ["tenant", "topics", "aliases"] });
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (tenantId) {
      const tenant = await tenantRepo.findOneBy({ id: tenantId });
      if (!tenant) return res.status(404).json({ message: "Tenant not found" });
      article.tenant = tenant;
    }

    article.title = title;
    article.body = body;
    article.publishedYear = publishedYear;

    if (topicIds) {
      const topics = await topicRepo.findByIds(topicIds);
      article.topics = topics;
    }

    if (aliases) article.aliases = aliases.map((text: string) => ({ text }));

    await articleRepo.save(article);
    logger.info(`Article updated: ${title}`);
    res.json(article);
  } catch (err: any) {
    logger.error(`Failed to update article: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await articleRepo.findOne({ where: { id: Number(req.params.id) } });
    if (!article) return res.status(404).json({ message: "Article not found" });

    await articleRepo.remove(article);
    logger.info(`Article deleted: ${article.title}`);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Failed to delete article: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
