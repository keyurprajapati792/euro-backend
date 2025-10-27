import fs from "fs";
import csv from "csv-parser";
import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

/**
 * Parses and imports data from the uploaded CSV.
 * 1️⃣ Creates/updates employees
 * 2️⃣ Creates partners linked to employees
 */
export const importCSVData = async (filePath) => {
  try {
    const rows = [];

    // Step 1: Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    const employeeMap = new Map();

    // Step 2: Process Employees
    for (const row of rows) {
      const empCode = row["Employee Code"]?.trim();
      if (!empCode) continue;

      const fullName = row["Employee Name"]?.trim() || "";
      const [firstname, ...lastnameParts] = fullName.split(" ");
      const lastname = lastnameParts.join(" ") || "";

      const employeeData = {
        empId: empCode,
        firstname,
        lastname,
        email: row["Employee email ID"]?.trim() || "",
        contact: row["Employee Ph No"]?.trim() || "",
      };

      let employee = await Employee.findOne({ empId: empCode });
      if (!employee) {
        employee = await Employee.create(employeeData);
      }

      employeeMap.set(empCode, employee._id);
    }

    // Step 3: Process Partners
    for (const row of rows) {
      const city = row["City"]?.trim();
      const empCode = row["Employee Code"]?.trim();
      const employeeId = employeeMap.get(empCode);

      // ---- Service Partner ----
      if (row["Service Business Partner Name"]) {
        await Partner.create({
          name: row["Service Business Partner Name"].trim(),
          contactPerson: row["Service POC"]?.trim(),
          phone: row["Service POC Number"]?.trim(),
          address: row["Service Business Partner Address"]?.trim(),
          partner_type: "service_partner",
          city,
          empId: employeeId,
        });
      }

      // ---- Direct Sales Partner ----
      if (row["Direct Sub Channel (CRC/Partner)"]) {
        await Partner.create({
          name: row["Direct Sub Channel (CRC/Partner)"].trim(),
          contactPerson: row["Direct POC"]?.trim(),
          phone: row["Direct POC Number"]?.trim(),
          address: row["CRC/Partner Address"]?.trim(),
          partner_type: "direct_sales_partner",
          sub_type: row["Direct Sub Channel (CRC/Partner)"]?.trim(),
          city,
          empId: employeeId,
        });
      }

      // ---- Retail Sales Partner ----
      if (row["Retail Sub Channel (GT/MT/AF)"]) {
        await Partner.create({
          name: row["Retail Sub Channel (GT/MT/AF)"].trim(),
          contactPerson: row["Retail POC"]?.trim(),
          phone: row["Retail POC Number"]?.trim(),
          partner_type: "retail_sales_partner",
          sub_type: row["Retail Sub Channel (GT/MT/AF)"]?.trim(),
          city,
          empId: employeeId,
        });
      }
    }

    console.log("✅ CSV data imported successfully");
  } catch (error) {
    console.error("❌ Error importing CSV:", error);
    throw error;
  }
};
