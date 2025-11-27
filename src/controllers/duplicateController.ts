import { AppDataSource } from "../data-source";
import { KnowledgeArticle } from "../entities/KnowledgeArticle";
import { DuplicateRecord } from "../entities/DuplicateRecord";

export const getPotentialDuplicates = async (req, res) => {
  try {
    const tenantId = Number(req.params.tenantId);

    const articleRepo = AppDataSource.getRepository(KnowledgeArticle);
    const duplicateRepo = AppDataSource.getRepository(DuplicateRecord);

    // Load all articles with aliases
    const articles = await articleRepo.find({
      where: { tenant: { id: tenantId } },
      relations: ["aliases"],
    });

    // HEURISTIC 1: Title/Alias Matching
    const map = new Map<string, KnowledgeArticle[]>();

    for (const article of articles) {
      const keys = new Set<string>();

      keys.add(article.title.toLowerCase());
      article.aliases.forEach(a => keys.add(a.text.toLowerCase()));

      for (const key of keys) {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(article);
      }
    }

    const heuristicGroups = [];
    for (const [key, group] of map.entries()) {
      if (group.length > 1) {
        heuristicGroups.push({
          matchKey: key,
          articles: group,
        });
      }
    }

    // HEURISTIC 2: Duplicate Logs from Consumer
    const storedDuplicates = await duplicateRepo.find({
      where: { tenantId },
    });

    const formattedDuplicates = storedDuplicates.map(d => ({
      newArticleId: d.newArticleId,
      existingArticleId: d.existingArticleId,
      reason: d.reason,
      timestamp: d.timestamp,
    }));

    return res.json({
      tenantId,
      heuristicGroups,
      loggedDuplicates: formattedDuplicates,
    });

  } catch (err) {
    console.error("[ERROR] Failed to fetch potential duplicates:", err);
    res.status(500).json({ message: "Server error" });
  }
};
