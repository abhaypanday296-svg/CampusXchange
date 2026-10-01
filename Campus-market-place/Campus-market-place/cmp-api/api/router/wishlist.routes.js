import express from "express";
import { isUser, protect } from "../middleware/auth.middleware.js";
import {
  toggleWishlist,
  getWishlist,
  getWishlistedIds,
} from "../controller/whislist.contolller.js"

const router = express.Router();

router.use(protect, isUser);

router.post("/toggle", toggleWishlist);
router.get("/get-all", getWishlist);
router.get("/ids", getWishlistedIds);

export default router;