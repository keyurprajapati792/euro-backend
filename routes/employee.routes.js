import express from "express";
import { EmployeeController } from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/", EmployeeController.create);
router.get("/list", EmployeeController.list);
router.get("/:id", EmployeeController.getById);
router.put("/:id", EmployeeController.update);
router.delete("/:id", EmployeeController.delete);

export default router;
