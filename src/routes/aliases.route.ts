import { Router } from "express";
import { createAlias, getAliases, getAliasById, updateAlias, deleteAlias } from "./../controllers/aliases.controller"; 

const router = Router();

router.post("/", createAlias);        // Create alias
router.get("/", getAliases);          // List all aliases
router.get("/:id", getAliasById);     // Get alias by ID
router.put("/:id", updateAlias);      // Update alias
router.delete("/:id", deleteAlias);   // Delete alias

export default router;
