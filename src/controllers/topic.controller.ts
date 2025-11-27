import { Request, Response } from "express";
import { Topic } from "../entities/Topic";
import logger from "../logger";
import { AppDataSource } from "../data-source";

const repo = AppDataSource.getRepository(Topic);

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const exists = await repo.findOneBy({ name });
    if (exists) return res.status(400).json({ message: "Topic already exists" });

    const topic = repo.create({ name });
    await repo.save(topic);
    logger.info(`Topic created: ${name}`);
    res.json(topic);
  } catch (err: any) {
    logger.error(`Failed to create topic: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listTopics = async (_req: Request, res: Response) => {
  try {
    const topics = await repo.find();
    res.json(topics);
  } catch (err: any) {
    logger.error(`Failed to list topics: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const topic = await repo.findOneBy({ id: Number(req.params.id) });
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json(topic);
  } catch (err: any) {
    logger.error(`Failed to get topic: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const topic = await repo.findOneBy({ id: Number(req.params.id) });
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const { name } = req.body;
    if (name) topic.name = name;

    await repo.save(topic);
    logger.info(`Topic updated: ${topic.name}`);
    res.json(topic);
  } catch (err: any) {
    logger.error(`Failed to update topic: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const topic = await repo.findOneBy({ id: Number(req.params.id) });
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    await repo.remove(topic);
    logger.info(`Topic deleted: ${topic.name}`);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Failed to delete topic: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
