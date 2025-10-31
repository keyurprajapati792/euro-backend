import express from "express";
import { PartnerController } from "../controllers/partner.controller.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

const allowBoth = authMiddleware(["admin", "employee"]);

router.post("/", allowBoth, PartnerController.create);
router.get("/", allowBoth, PartnerController.list);
router.get("/:id", allowBoth, PartnerController.getById);
router.get("/by-employee/:empId", allowBoth, PartnerController.getByEmpId);
router.put("/:id", allowBoth, PartnerController.update);
router.delete("/:id", allowBoth, PartnerController.delete);

export default router;
