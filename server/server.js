import express from "express";
import cors from "cors";
import "dotenv/config";
import payfastRouter from "./routes/Payfast.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payfast", payfastRouter);

app.get("/", (req, res) => res.send("Server is running well"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
