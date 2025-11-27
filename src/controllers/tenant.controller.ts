import { Request, Response } from "express";
import { Tenant } from "../entities/Tenant";
import logger from "../logger";
import { AppDataSource } from "../data-source";

const repo = AppDataSource.getRepository(Tenant);

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, primaryLocale } = req.body;
    if (!name || !primaryLocale) return res.status(400).json({ error: "Missing fields" });
    
    const existing = await repo.findOneBy({ name });
    if (existing) return res.status(400).json({ message: "Tenant name must be unique" });

    const tenant = repo.create({ name, primaryLocale });
    await repo.save(tenant);
    logger.info(`Tenant created: ${name}`);
    res.json(tenant);
  } catch (err: any) {
    logger.error(`Failed to create tenant: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listTenants = async (_req: Request, res: Response) => {
  try {
    const tenants = await repo.find();
    res.json(tenants);
  } catch (err: any) {
    logger.error(`Failed to list tenants: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await repo.findOneBy({ id: Number(req.params.id) });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.json(tenant);
  } catch (err: any) {
    logger.error(`Failed to get tenant: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await repo.findOneBy({ id: Number(req.params.id) });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const { name, primaryLocale } = req.body;
    if (name && name !== tenant.name) {
      const exists = await repo.findOneBy({ name });
      if (exists) return res.status(400).json({ message: "Tenant name must be unique" });
      tenant.name = name;
    }
    if (primaryLocale) tenant.primaryLocale = primaryLocale;

    await repo.save(tenant);
    logger.info(`Tenant updated: ${tenant.name}`);
    res.json(tenant);
  } catch (err: any) {
    logger.error(`Failed to update tenant: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await repo.findOneBy({ id: Number(req.params.id) });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    await repo.remove(tenant);
    logger.info(`Tenant deleted: ${tenant.name}`);
    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Failed to delete tenant: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
