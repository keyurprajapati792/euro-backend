import express from "express";
import { EmployeeController } from "../controllers/employee.controller.js";
import { authMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// allow both roles
const allowBoth = authMiddleware(["admin", "employee"]);

router.post("/", allowBoth, EmployeeController.create);
router.get("/list", allowBoth, EmployeeController.list);
router.get("/:id", allowBoth, EmployeeController.getById);
router.put("/:id", allowBoth, EmployeeController.update);
router.delete("/:id", allowBoth, EmployeeController.delete);

export default router;
