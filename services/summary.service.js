import Employee from "../models/employee.js";
import Partner from "../models/partner.js";
import { Survey } from "../models/survey.js";

export class SummaryService {
  // Get dashboard summary for admin
  static async getDashboardStats() {
    try {
      const employees = await Employee.countDocuments();
      const servicePartners = await Partner.countDocuments({
        partner_type: "Service Partner",
      });
      const directSalesPartners = await Partner.countDocuments({
        partner_type: "Direct Sales Partner",
      });
      const retailSalesPartners = await Partner.countDocuments({
        partner_type: "Retail Sales Partner",
      });
      const surveys = await Survey.countDocuments({ state: "submitted" });

      return {
        employees,
        servicePartners,
        directSalesPartners,
        retailSalesPartners,
        surveys,
      };
    } catch (err) {
      throw new Error("Error fetching dashboard stats: " + err.message);
    }
  }
}
