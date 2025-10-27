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

  static async getPartners(filter = {}) {
    return await Partner.find(filter).populate(
      "empId",
      "firstname lastname employeeId contact"
    );
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
