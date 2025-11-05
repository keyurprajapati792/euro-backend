import fs from "fs";
import csv from "csv-parser";
import Employee from "../models/employee.js";
import Partner from "../models/partner.js";

// In-memory caching to reduce DB hits
const employeeCache = new Map();
const partnerCache = new Map();

/**
 * ✅ Helper: Add or Update Partner by contactPerson + partner_type
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
  if (!contactPerson && partner_type !== "Service Partner") return;

  let partner;

  if (partner_type === "Service Partner") {
    // Check existing partner by name + address
    partner = await Partner.findOne({
      partner_type: "Service Partner",
      name: name?.trim(),
      address: address?.trim(),
    });
  } else {
    // Direct / Retail Partner: check by contactPerson + phone
    partner = await Partner.findOne({
      partner_type,
      contactPerson: contactPerson?.trim(),
      phone: phone?.trim(),
    });
  }

  // Create new partner if not exists
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
    // Update only blank fields
    if (name && !partner.name) partner.name = name;
    if (phone && !partner.phone) partner.phone = phone;
    if (city && !partner.city) partner.city = city;
    if (sub_type && !partner.sub_type) partner.sub_type = sub_type;
    if (address && !partner.address) partner.address = address;
  }

  // Avoid duplicate visits
  const visitExists = partner.employeeVisits.some(
    (v) =>
      v.employeeId.toString() === employeeId.toString() &&
      v.visitDate === visitDate
  );

  if (!visitExists && visitDate) {
    partner.employeeVisits.push({ employeeId, visitDate });
  }

  await partner.save();
  return partner;
}

/**
 * ✅ CSV Import Function (No Chunk)
 */
export const importCSVData = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        try {
          const empCode = row["Employee Code"]?.trim();
          if (!empCode) return;

          // ✅ Check employee cache or DB
          let employee = employeeCache.get(empCode);
          if (!employee) {
            employee = await Employee.findOne({ empId: empCode });
            if (!employee) {
              const fullName = row["Employee Name"]?.trim() || "";
              const [firstname, ...lastnameParts] = fullName.split(" ");
              const lastname = lastnameParts.join(" ");

              employee = await Employee.create({
                empId: empCode,
                firstname,
                lastname,
                email: row["Employee email ID"]?.trim(),
                contact: row["Employee Ph No"]?.trim(),
                city: row["City"]?.trim(),
              });
            }

            employeeCache.set(empCode, employee);
          }

          const employeeId = employee._id;
          const city = row["City"]?.trim();

          const serviceVisit = row["Service Partner Visit Date"]?.trim();
          const directVisit = row["Direct Partner Visit Date"]?.trim();
          const retailVisit = row["Retail Partner Visit Date"]?.trim();

          /** ✅ SERVICE PARTNER */
          if (row["Service POC"]) {
            const partner = await addOrUpdatePartner({
              partner_type: "Service Partner",
              name: row["Service Business Partner Name"]?.trim(),
              contactPerson: row["Service POC"]?.trim(),
              phone: row["Service POC Number"]?.trim(),
              address: row["Service Business Partner Address"]?.trim(),
              city,
              employeeId,
              visitDate: serviceVisit,
            });

            if (partner && !employee.servicePartnerId) {
              employee.servicePartnerId = partner._id;
              await employee.save();
            }
          }

          /** ✅ DIRECT PARTNER */
          if (row["Direct POC"]) {
            const partner = await addOrUpdatePartner({
              partner_type: "Direct Sales Partner",
              contactPerson: row["Direct POC"]?.trim(),
              phone: row["Direct POC Number"]?.trim(),
              address: row["CRC/Partner Address"]?.trim(),
              sub_type: row["Direct Sub Channel (CRC/Partner)"]?.trim(),
              city,
              employeeId,
              visitDate: directVisit,
            });

            if (partner && !employee.directPartnerId) {
              employee.directPartnerId = partner._id;
              await employee.save();
            }
          }

          /** ✅ RETAIL PARTNER */
          if (row["Retail POC"]) {
            const partner = await addOrUpdatePartner({
              partner_type: "Retail Sales Partner",
              contactPerson: row["Retail POC"]?.trim(),
              phone: row["Retail POC Number"]?.trim(),
              sub_type: row["Retail Sub Channel (GT/MT/AF)"]?.trim(),
              city,
              employeeId,
              visitDate: retailVisit,
            });

            if (partner && !employee.retailPartnerId) {
              employee.retailPartnerId = partner._id;
              await employee.save();
            }
          }
        } catch (err) {
          console.error("❌ CSV Row Error:", err);
        }
      })
      .on("end", () => {
        console.log("✅ CSV Import Completed without chunk");

        // ✅ Clear caches after import
        employeeCache.clear();
        partnerCache.clear();

        resolve();
      })
      .on("error", reject);
  });
};
