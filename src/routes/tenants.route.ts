import { Router } from "express";
import {
  createTenant,
  listTenants,
  getTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/tenant.controller";

const router = Router();

router.post("/", createTenant);
router.get("/", listTenants);
router.get("/:id", getTenant);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);

export default router;
