import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

export class EmployeeService {
  static async createEmployee(data) {
    // Convert empty strings to null
    const cleanedData = {
      ...data,
      servicePartnerId: data.servicePartnerId || null,
      directPartnerId: data.directPartnerId || null,
      retailPartnerId: data.retailPartnerId || null,
    };

    const employee = new Employee(cleanedData);
    const savedEmployee = await employee.save();

    const partnerIds = [
      cleanedData.servicePartnerId,
      cleanedData.directPartnerId,
      cleanedData.retailPartnerId,
    ].filter(Boolean);

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

    // Convert empty strings to null
    const cleanedData = {
      ...data,
      servicePartnerId: data.servicePartnerId || null,
      directPartnerId: data.directPartnerId || null,
      retailPartnerId: data.retailPartnerId || null,
    };

    const partnerKeys = [
      "servicePartnerId",
      "directPartnerId",
      "retailPartnerId",
    ];

    // Remove empId from old partners when employee moved
    for (const key of partnerKeys) {
      if (
        existingEmployee[key] &&
        cleanedData[key] !== existingEmployee[key].toString()
      ) {
        await Partner.findByIdAndUpdate(existingEmployee[key], { empId: null });
      }
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(id, cleanedData, {
      new: true,
      runValidators: true,
    });

    // Assign employee to new partners
    const newPartnerIds = partnerKeys
      .map((key) => cleanedData[key])
      .filter(Boolean);

    for (const partnerId of newPartnerIds) {
      await Partner.findByIdAndUpdate(partnerId, {
        empId: updatedEmployee._id,
      });
    }

    return updatedEmployee;
  }

  static async deleteEmployee(id) {
    const employee = await Employee.findById(id);
    if (!employee) return null;

    const partnerKeys = [
      "servicePartnerId",
      "directPartnerId",
      "retailPartnerId",
    ];

    for (const key of partnerKeys) {
      if (employee[key]) {
        await Partner.findByIdAndUpdate(employee[key], { empId: null });
      }
    }
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

  static async getEmployees(search = "", page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // 🔍 Build search condition
    const searchCondition = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } },
            { lastname: { $regex: search, $options: "i" } },
            { empId: { $regex: search, $options: "i" } },
            { contact: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [employees, total] = await Promise.all([
      Employee.find(searchCondition)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Employee.countDocuments(searchCondition),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { employees, total, totalPages, currentPage: page };
  }

  static async getEmployeeById(id) {
    return await Employee.findById(id);
  }
}
