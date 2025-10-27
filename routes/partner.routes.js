import express from "express";
import { PartnerController } from "../controllers/partner.controller.js";

const router = express.Router();

router.post("/", PartnerController.create);
router.get("/", PartnerController.list);
router.get("/:id", PartnerController.getById);
router.get("/:employeeId", PartnerController.getByEmpId);
router.put("/:id", PartnerController.update);
router.delete("/:id", PartnerController.delete);

export default router;
