import express from "express";
import {
  getAllusers,
  getUser,
  signin,
  signup,
  signout,
  updateProfile,
  isVerifiedUser,
} from "../controller/auth.controller.js";
import { isAdmin, protect } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/get-user", protect, getUser);
router.post("/signout", signout);
router.put("/update-profile", protect, updateProfile);

//admin
router.get("/admin/getAll-users", protect, isAdmin, getAllusers);
router.post("/adminverify-user/:id", protect, isAdmin, isVerifiedUser);

export default router;
