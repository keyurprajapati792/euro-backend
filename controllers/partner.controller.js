import { PartnerService } from "../services/partner.service.js";

export class PartnerController {
  static async create(req, res, next) {
    try {
      const partner = await PartnerService.createPartner(req.body);
      res.status(201).json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await PartnerService.updatePartner(id, req.body);
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Partner not found" });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await PartnerService.deletePartner(id);
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Partner not found" });
      res.json({ success: true, message: "Partner deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const { page = 1, limit, partner_type, sub_type, search } = req.query;

      const filter = {};
      if (partner_type) filter.partner_type = partner_type;
      if (sub_type && sub_type !== "All") filter.sub_type = sub_type;

      const data = await PartnerService.getPartners(
        filter,
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
      const partner = await PartnerService.getPartnerById(id);
      if (!partner)
        return res
          .status(404)
          .json({ success: false, message: "Partner not found" });
      res.json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  }

  static async getByEmpId(req, res, next) {
    try {
      const { empId } = req.params;
      const partners = await PartnerService.getPartnerByEmpId(empId);
      if (!partners)
        return res
          .status(404)
          .json({ success: false, message: "Partner not found" });
      res.json({ success: true, data: partners });
    } catch (error) {
      next(error);
    }
  }
}
