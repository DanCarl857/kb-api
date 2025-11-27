import { Router } from "express";
import {
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topic.controller";

const router = Router();

router.post("/", createTopic);
router.get("/", listTopics);
router.get("/:id", getTopic);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

export default router;
