import cloudinaryPKg from "cloudinary"
import dotenv from "dotenv"
dotenv.config()
const {v2:cloudinary}=cloudinaryPKg; // importing the package from the cloudinarypkg like expresss.json;

 cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary