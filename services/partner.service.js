import Partner from "../models/partner.js";

export class PartnerService {
  static async createPartner(data) {
    const partner = new Partner(data);
    return await partner.save();
  }

  static async updatePartner(id, data) {
    const updatedPartner = await Partner.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return updatedPartner;
  }

  static async deletePartner(id) {
    return await Partner.findByIdAndDelete(id);
  }

  static async getPartners(filter = {}, search = "", page = 1, limit = null) {
    const skip = (page - 1) * (limit || 0);

    const searchCondition = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { contactPerson: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const query = { ...filter, ...searchCondition };

    let dbQuery = Partner.find(query)
      .populate("employeeVisits.employeeId", "firstname lastname empId contact")
      .sort({ createdAt: -1 });

    if (limit) {
      dbQuery = dbQuery.skip(skip).limit(limit);
    }

    const [partners, total] = await Promise.all([
      dbQuery,
      Partner.countDocuments(query),
    ]);

    return {
      partners,
      total,
      currentPage: limit ? page : 1,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  }

  static async getPartnerById(id) {
    return await Partner.findById(id).populate(
      "employeeVisits.employeeId",
      "firstname lastname empId contact"
    );
  }

  static async getPartnerByEmpId(empId) {
    return await Partner.find({
      "employeeVisits.employeeId": empId,
    }).populate(
      "employeeVisits.employeeId",
      "firstname lastname empId contact"
    );
  }
}
