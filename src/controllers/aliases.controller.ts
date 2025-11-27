import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Alias } from "../entities/Alias";
import { KnowledgeArticle as Article } from "../entities/KnowledgeArticle";

const aliasRepository = AppDataSource.getRepository(Alias);
const articleRepository = AppDataSource.getRepository(Article);

export const createAlias = async (req: Request, res: Response) => {
  try {
    const { text, articleId } = req.body;

    const article = await articleRepository.findOne({ where: { id: articleId } });
    if (!article) return res.status(404).json({ message: "Article not found" });

    const alias = new Alias();
    alias.text = text;
    alias.article = article;

    await aliasRepository.save(alias);
    res.status(201).json(alias);
  } catch (err) {
    console.error("[ERROR]", new Date().toLocaleTimeString(), "Failed to create alias:", err.message);
    res.status(500).json({ message: "Failed to create alias" });
  }
};

export const getAliases = async (_req: Request, res: Response) => {
  const aliases = await aliasRepository.find({ relations: ["article"] });
  res.json(aliases);
};

export const getAliasById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const alias = await aliasRepository.findOne({ where: { id }, relations: ["article"] });
  if (!alias) return res.status(404).json({ message: "Alias not found" });
  res.json(alias);
};

export const updateAlias = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;

  const alias = await aliasRepository.findOne({ where: { id } });
  if (!alias) return res.status(404).json({ message: "Alias not found" });

  alias.text = text ?? alias.text;
  await aliasRepository.save(alias);

  res.json(alias);
};

export const deleteAlias = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const alias = await aliasRepository.findOne({ where: { id } });
  if (!alias) return res.status(404).json({ message: "Alias not found" });

  await aliasRepository.remove(alias);
  res.json({ message: "Alias deleted" });
};
