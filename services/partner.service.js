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

  static async getPartners(filter = {}, search = "", page = 1, limit = 10) {
    const skip = (page - 1) * limit;

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

    const [partners, total] = await Promise.all([
      Partner.find(query)
        .populate("empId", "firstname lastname employeeId contact")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Partner.countDocuments(query),
    ]);

    return {
      partners,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPartnerById(id) {
    return await Partner.findById(id).populate(
      "empId",
      "firstname lastname employeeId contact"
    );
  }

  static async getPartnerByEmpId(empId) {
    return await Partner.find({ empId });
  }
}
