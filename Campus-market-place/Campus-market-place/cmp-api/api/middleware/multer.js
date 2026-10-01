import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {   //👉 params = Cloudinary upload settings object
    folder: "campus-market-place",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "heic"],
  },
});

const upload = multer({ storage });  // REQ.FILE

export default upload;   