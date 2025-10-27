import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
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

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/dashboard", summaryRoutes);
app.use("/api/survey", surveyRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Server Connected");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// importCSVData("./utils/dummy.csv");
