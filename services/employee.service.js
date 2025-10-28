import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

export class EmployeeService {
  static async createEmployee(data) {
    const employee = new Employee(data);
    const savedEmployee = await employee.save();

    const partnerIds = [
      data.servicePartnerId,
      data.directPartnerId,
      data.retailPartnerId,
    ].filter(Boolean);

    // Assign this employee to all selected partners
    for (const partnerId of partnerIds) {
      await Partner.findByIdAndUpdate(partnerId, {
        empId: savedEmployee._id,
      });
    }

    return savedEmployee;
  }

  static async updateEmployee(id, data) {
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) return null;

    const partnerKeys = [
      "servicePartnerId",
      "directPartnerId",
      "retailPartnerId",
    ];

    // Remove empId from old partners if employee has been reassigned
    for (const key of partnerKeys) {
      if (
        existingEmployee[key] && // old partner exists
        data[key] && // new partner exists
        existingEmployee[key].toString() !== data[key] // changed
      ) {
        await Partner.findByIdAndUpdate(existingEmployee[key], {
          empId: null,
        });
      }
    }

    // Update the employee record itself
    const updatedEmployee = await Employee.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    // Assign employee to new partner(s)
    const newPartnerIds = partnerKeys.map((key) => data[key]).filter(Boolean);

    for (const partnerId of newPartnerIds) {
      await Partner.findByIdAndUpdate(partnerId, {
        empId: updatedEmployee._id,
      });
    }

    return updatedEmployee;
  }

  static async deleteEmployee(id) {
    return await Employee.findByIdAndDelete(id);
  }

  // static async deleteEmployee(id) {
  //   const employee = await Employee.findById(id);
  //   if (!employee) return null;

  //   const partnerIds = [
  //     employee.servicePartnerId,
  //     employee.directPartnerId,
  //     employee.retailPartnerId,
  //   ].filter(Boolean);

  //   for (const partnerId of partnerIds) {
  //     await Partner.findByIdAndUpdate(partnerId, {
  //       $pull: { employees: id },
  //     });
  //   }

  //   return await Employee.findByIdAndDelete(id);
  // }

  static async getEmployees() {
    return await Employee.find();
  }

  static async getEmployeeById(id) {
    return await Employee.findById(id);
  }
}
