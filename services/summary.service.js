import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

export class SummaryService {
  // Get dashboard summary for admin
  static async getDashboardStats() {
    try {
      const employees = await Employee.countDocuments();
      const servicePartners = await Partner.countDocuments({
        partner_type: "service_partner",
      });
      const directSalesPartners = await Partner.countDocuments({
        partner_type: "direct_sales_partner",
      });
      const retailSalesPartners = await Partner.countDocuments({
        partner_type: "retail_sales_partner",
      });

      return {
        employees,
        servicePartners,
        directSalesPartners,
        retailSalesPartners,
      };
    } catch (err) {
      throw new Error("Error fetching dashboard stats: " + err.message);
    }
  }
}
