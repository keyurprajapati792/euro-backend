import Partner from "../models/partner.js";
import mongoose from "mongoose";

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
    const objectId = new mongoose.Types.ObjectId(empId);

    const partners = await Partner.aggregate([
      {
        $match: {
          "employeeVisits.employeeId": objectId,
        },
      },
      // Only keep visits for this specific employee
      {
        $project: {
          name: 1,
          contactPerson: 1,
          phone: 1,
          address: 1,
          city: 1,
          partner_type: 1,
          sub_type: 1,
          employeeVisits: {
            $filter: {
              input: "$employeeVisits",
              as: "visit",
              cond: { $eq: ["$$visit.employeeId", objectId] },
            },
          },
        },
      },
      // Lookup to get employee info
      {
        $lookup: {
          from: "employees",
          localField: "employeeVisits.employeeId",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      {
        $unwind: {
          path: "$employeeInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "employeeVisits.employee": {
            firstname: "$employeeInfo.firstname",
            lastname: "$employeeInfo.lastname",
            empId: "$employeeInfo.empId",
            contact: "$employeeInfo.contact",
          },
        },
      },
      {
        $project: {
          employeeInfo: 0,
        },
      },
    ]);

    return partners;
  }
}
