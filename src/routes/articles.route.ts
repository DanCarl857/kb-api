import { Router } from "express";
import {
  createArticle,
  listArticles,
  getArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/article.controller";

const router = Router();

router.post("/", createArticle);
router.get("/", listArticles);
router.get("/:id", getArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router;
