import { EmployeeService } from "../services/employee.service.js";

export class EmployeeController {
  static async create(req, res, next) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await EmployeeService.updateEmployee(id, req.body);
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await EmployeeService.deleteEmployee(id);
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      res.json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const data = await EmployeeService.getEmployees(
        search,
        Number(page),
        Number(limit)
      );

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await EmployeeService.getEmployeeById(id);
      if (!employee)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      res.json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }
}
