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
      const filter = {};

      if (req.query.partner_type) {
        filter.partner_type = req.query.partner_type;
      }

      if (req.query.sub_type && req.query.sub_type !== "All") {
        filter.sub_type = req.query.sub_type;
      }

      const partners = await PartnerService.getPartners(filter);
      res.json({ success: true, data: partners });
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
      const { employeeId } = req.params;
      const partners = await PartnerService.getPartnerByEmpId(employeeId);
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
