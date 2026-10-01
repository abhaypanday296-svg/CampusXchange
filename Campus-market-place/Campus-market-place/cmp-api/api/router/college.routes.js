import express from "express";
import { createCollege, getCollege } from "../controller/college.controller.js";
import { isAdmin, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/admin", protect, isAdmin, createCollege);
router.get("/get-colleges", getCollege)

export default router;