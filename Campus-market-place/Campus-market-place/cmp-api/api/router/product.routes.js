import express from "express";
import { createProduct ,getAllProducts,getMyListing,markAsSold,
  updateProduct,
  deleteProduct,
} from "../controller/Product.controller.js";
import upload from "../middleware/multer.js";
import { isUser, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  isUser,
  upload.array("image", 5),
  createProduct,
);
router.get("/get-all", getAllProducts);
router.get("/get-myListing", protect, isUser, getMyListing);
router.patch("/mark-as-sold/:id", protect, isUser, markAsSold);
router.put(
  "/update/:id",
  protect,
  isUser,
  upload.array("image", 5),
  updateProduct,
);
router.delete("/delete/:id", protect, isUser, deleteProduct);

export default router;


