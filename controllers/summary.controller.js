import { SummaryService } from "../services/summary.service.js";

export class SummaryController {
  // GET /api/summary/dashboard
  static async dashboard(req, res) {
    try {
      const stats = await SummaryService.getDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
