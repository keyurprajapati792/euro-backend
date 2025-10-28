import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";
import { connectDB } from "./config/db.js";

import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import surveyRoutes from "./routes/survey.routes.js";
import { importCSVData } from "./utils/csvImport.js";

dotenv.config();
connectDB();

const app = express();

// -------------------- Middlewares --------------------
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// -------------------- Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/dashboard", summaryRoutes);
app.use("/api/survey", surveyRoutes);

// -------------------- CSV Upload Setup --------------------
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const csvFileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() !== ".csv") {
    return cb(new Error("Only CSV files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: csvFileFilter });

// -------------------- CSV Upload Route --------------------
app.post("/api/csv/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "CSV file is required" });
    }

    const filePath = req.file.path;
    await importCSVData(filePath);

    res.json({
      success: true,
      message: "CSV uploaded and data imported successfully!",
    });
  } catch (error) {
    console.error("CSV Upload Error:", error);
    next(error);
  }
});

// -------------------- Root Route --------------------
app.get("/", (req, res) => {
  res.send("✅ Server Connected Successfully!");
});

// -------------------- Error Handling Middleware --------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
