import { Router } from "express";
import { getPotentialDuplicates } from "../controllers/duplicateController";

const router = Router();

router.get("/tenants/:tenantId/duplicates", getPotentialDuplicates);

export default router;
