import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

export class EmployeeService {
  static async createEmployee(data) {
    const cleanedData = {
      ...data,
      servicePartnerId: data.servicePartnerId || null,
      directPartnerId: data.directPartnerId || null,
      retailPartnerId: data.retailPartnerId || null,
    };

    const employee = new Employee(cleanedData);
    const savedEmployee = await employee.save();

    const partnerVisits = [
      { partnerId: cleanedData.servicePartnerId, date: data.serviceVisitDate },
      { partnerId: cleanedData.directPartnerId, date: data.directVisitDate },
      { partnerId: cleanedData.retailPartnerId, date: data.retailVisitDate },
    ].filter((p) => p.partnerId && p.date);

    for (const pv of partnerVisits) {
      const partner = await Partner.findById(pv.partnerId);

      if (!partner) continue;

      // ✅ Check duplicate (same emp + same date)
      const exists = partner.employeeVisits.some(
        (ev) =>
          ev.employeeId.toString() === savedEmployee._id.toString() &&
          ev.visitDate === pv.date
      );

      if (!exists) {
        partner.employeeVisits.push({
          employeeId: savedEmployee._id,
          visitDate: pv.date,
        });
        await partner.save();
      }
    }

    return savedEmployee;
  }

  static async updateEmployee(id, data) {
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) return null;

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

    // ✅ Remove from old partners if changed
    for (const key of partnerKeys) {
      if (
        existingEmployee[key] &&
        cleanedData[key] !== existingEmployee[key]?.toString()
      ) {
        await Partner.findByIdAndUpdate(existingEmployee[key], {
          $pull: { employeeVisits: { employeeId: id } },
          empId: null,
        });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, cleanedData, {
      new: true,
      runValidators: true,
    });

    const partnerVisits = [
      { partnerId: cleanedData.servicePartnerId, date: data.serviceVisitDate },
      { partnerId: cleanedData.directPartnerId, date: data.directVisitDate },
      { partnerId: cleanedData.retailPartnerId, date: data.retailVisitDate },
    ].filter((p) => p.partnerId && p.date);

    for (const pv of partnerVisits) {
      const partner = await Partner.findById(pv.partnerId);
      if (!partner) continue;

      const existingVisit = partner.employeeVisits.find(
        (ev) => ev.employeeId.toString() === updatedEmployee._id.toString()
      );

      if (existingVisit) {
        // ✅ Update existing visit date
        existingVisit.visitDate = pv.date;
      } else {
        // ✅ Add a new visit entry
        partner.employeeVisits.push({
          employeeId: updatedEmployee._id,
          visitDate: pv.date,
        });
      }

      await partner.save();
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
        await Partner.findByIdAndUpdate(employee[key], {
          empId: null,
          $pull: { employeeVisits: { employeeId: id } },
        });
      }
    }

    return await Employee.findByIdAndDelete(id);
  }

  static async getEmployees(search = "", page = 1, limit = 10) {
    const skip = (page - 1) * limit;

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

    const employees = await Employee.aggregate([
      { $match: searchCondition },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: "partners",
          let: { empId: "$_id" },
          pipeline: [
            { $unwind: "$employeeVisits" },
            {
              $match: {
                $expr: { $eq: ["$employeeVisits.employeeId", "$$empId"] },
              },
            },
            {
              $project: {
                partnerId: "$_id",
                partnerName: "$name",
                contactPerson: "$contactPerson",
                partner_type: 1,
                visitDate: "$employeeVisits.visitDate",
                _id: 0,
              },
            },
          ],
          as: "partnerVisits",
        },
      },
    ]);

    const total = await Employee.countDocuments(searchCondition);
    const totalPages = Math.ceil(total / limit);

    return { employees, total, totalPages, currentPage: page };
  }

  static async getEmployeeById(id) {
    const results = await Employee.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      {
        $lookup: {
          from: "partners",
          let: { empId: "$_id" },
          pipeline: [
            { $unwind: "$employeeVisits" },
            {
              $match: {
                $expr: { $eq: ["$employeeVisits.employeeId", "$$empId"] },
              },
            },
            {
              $project: {
                partnerId: "$_id",
                visitDate: "$employeeVisits.visitDate",
                _id: 0,
              },
            },
          ],
          as: "partnerVisits",
        },
      },
    ]);

    return results[0];
  }
}
