import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

/**
 * Helper: Add or Update Partner by contactPerson
 */
async function addOrUpdatePartner({
  partner_type,
  contactPerson,
  phone,
  name,
  city,
  address,
  sub_type,
  employeeId,
  visitDate,
}) {
  if (!contactPerson) return;

  // Find partner by contact person
  let partner = await Partner.findOne({ contactPerson: contactPerson.trim() });

  // If not exists, create new partner
  if (!partner) {
    partner = new Partner({
      partner_type,
      contactPerson,
      phone,
      name,
      city,
      address,
      sub_type,
      employeeVisits: [],
    });
  } else {
    // Update name/phone/address if missing
    if (name && !partner.name) partner.name = name;
    if (phone && !partner.phone) partner.phone = phone;
    if (address && !partner.address) partner.address = address;
    if (city && !partner.city) partner.city = city;
    if (sub_type && !partner.sub_type) partner.sub_type = sub_type;
  }

  // Avoid duplicate employee visit entry
  const exists = partner.employeeVisits.find(
    (v) =>
      v.employeeId.toString() === employeeId.toString() &&
      v.visitDate === visitDate
  );

  if (!exists) {
    partner.employeeVisits.push({ employeeId, visitDate });
  }

  await partner.save();
  return partner;
}

/**
 * CSV Import Function
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
      const lastname = lastnameParts.join(" ");

      const email = row["Employee email ID"]?.trim() || "";
      const contact = row["Employee Ph No"]?.trim() || "";
      const city = row["City"]?.trim();

      // Find/Create employee
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

      const employeeId = employee._id;

      // Visit Dates
      const serviceVisitDate = row["Service Partner Visit Date"]?.trim() || "";
      const directVisitDate = row["Direct Partner Visit Date"]?.trim() || "";
      const retailVisitDate = row["Retail Partner Visit Date"]?.trim() || "";

      // Service Partner
      if (row["Service POC"]) {
        await addOrUpdatePartner({
          partner_type: "Service Partner",
          name: row["Service Business Partner Name"]?.trim(),
          contactPerson: row["Service POC"]?.trim(),
          phone: row["Service POC Number"]?.trim(),
          address: row["Service Business Partner Address"]?.trim(),
          city,
          employeeId,
          visitDate: serviceVisitDate,
        });
      }

      // Direct Partner
      if (row["Direct POC"]) {
        await addOrUpdatePartner({
          partner_type: "Direct Sales Partner",
          contactPerson: row["Direct POC"]?.trim(),
          phone: row["Direct POC Number"]?.trim(),
          address: row["CRC/Partner Address"]?.trim(),
          sub_type: row["Direct Sub Channel (CRC/Partner)"]?.trim(),
          city,
          employeeId,
          visitDate: directVisitDate,
        });
      }

      // Retail Partner
      if (row["Retail POC"]) {
        await addOrUpdatePartner({
          partner_type: "Retail Sales Partner",
          contactPerson: row["Retail POC"]?.trim(),
          phone: row["Retail POC Number"]?.trim(),
          sub_type: row["Retail Sub Channel (GT/MT/AF)"]?.trim(),
          city,
          employeeId,
          visitDate: retailVisitDate,
        });
      }
    }

    console.log("CSV import finished — partners linked to employees.");
  } catch (error) {
    console.error("CSV Import Error:", error);
    throw error;
  }
};
