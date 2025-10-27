import Employee from "../models/employee.js";

export class EmployeeService {
  static async createEmployee(data) {
    const employee = new Employee(data);
    return await employee.save();
  }

  static async updateEmployee(id, data) {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return updatedEmployee;
  }

  static async deleteEmployee(id) {
    return await Employee.findByIdAndDelete(id);
  }

  static async getEmployees() {
    return await Employee.find();
  }

  static async getEmployeeById(id) {
    return await Employee.findById(id);
  }
}
