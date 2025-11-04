import fs from "fs";
import csv from "csv-parser";
import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

/**
 * CSV Import Logic (Row-by-Row)
 * For each row:
 *   1. Create or update Employee (with hashed password)
 *   2. Create 0–3 Partner records
 *   3. Update Employee with partner IDs
 */
export const importCSVData = async (filePath) => {
  try {
    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    for (const row of rows) {
      const empCode = row["Employee Code"]?.trim();
      if (!empCode) continue;

      const fullName = row["Employee Name"]?.trim() || "";
      const [firstname, ...lastnameParts] = fullName.split(" ");
      const lastname = lastnameParts.join(" ") || "";

      const email = row["Employee email ID"]?.trim() || "";
      const contact = row["Employee Ph No"]?.trim() || "";
      const city = row["City"]?.trim();

      // find/create employee
      let employee = await Employee.findOne({ empId: empCode });

      if (!employee) {
        employee = await Employee.create({
          empId: empCode,
          firstname,
          lastname,
          email,
          contact,
        });
      }

      const empId = employee._id;
      const updateData = {};

      // ✅ Get Visit Dates as string
      const serviceVisitDate = row["Service Partner Visit Date"]?.trim() || "";
      const directVisitDate = row["Direct Partner Visit Date"]?.trim() || "";
      const retailVisitDate = row["Retail Partner Visit Date"]?.trim() || "";

      // ✅ Service Partner
      if (row["Service Business Partner Name"]) {
        const servicePartner = await Partner.create({
          name: row["Service Business Partner Name"].trim(),
          contactPerson: row["Service POC"]?.trim(),
          phone: row["Service POC Number"]?.trim(),
          address: row["Service Business Partner Address"]?.trim(),
          partner_type: "Service Partner",
          city,
          empId,
          visit_date: serviceVisitDate,
        });
        updateData.servicePartnerId = servicePartner._id;
      }

      // ✅ Direct Partner
      if (row["Direct Sub Channel (CRC/Partner)"]) {
        const directPartner = await Partner.create({
          contactPerson: row["Direct POC"]?.trim(),
          phone: row["Direct POC Number"]?.trim(),
          address: row["CRC/Partner Address"]?.trim(),
          partner_type: "Direct Sales Partner",
          sub_type: row["Direct Sub Channel (CRC/Partner)"]?.trim(),
          city,
          empId,
          visit_date: directVisitDate,
        });
        updateData.directPartnerId = directPartner._id;
      }

      // ✅ Retail Partner
      if (row["Retail Sub Channel (GT/MT/AF)"]) {
        const retailPartner = await Partner.create({
          contactPerson: row["Retail POC"]?.trim(),
          phone: row["Retail POC Number"]?.trim(),
          partner_type: "Retail Sales Partner",
          sub_type: row["Retail Sub Channel (GT/MT/AF)"]?.trim(),
          city,
          empId,
          visit_date: retailVisitDate,
        });
        updateData.retailPartnerId = retailPartner._id;
      }

      if (Object.keys(updateData).length > 0) {
        await Employee.findByIdAndUpdate(empId, updateData);
      }
    }

    console.log("✅ CSV import completed — Visit Dates stored as string!");
  } catch (error) {
    console.error("❌ Error during CSV import:", error);
    throw error;
  }
};
