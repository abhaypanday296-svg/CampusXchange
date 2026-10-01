import { College } from "../models/college.schema.js";
import { Product } from "../models/product.js";
import { Wishlist } from "../models/wishlist.schema.js";

 export const  toggleWishlist= async(req,res,next)=>{
    try{
        const userID= req.user.id
        const{productId}= req.body

        if(!productId){
           return res.status(400).json({ message: "Product ID is required" });

        }


        // checking it ki agr koi product par har toh nahi pehla sae wishlist mae 
        const existing = await Wishlist.findOne({user:userID, product:productId})
         if(existing){
             await Wishlist.findByIdAndDelete(existing._id)
             return res.status(200).json({
                message:"Remove from wishlist",
                isWishlist:false
             })
         }
         else{
            await  Wishlist.create({user:userID , product:productId})
            return res.status(200).json({
                message:"Item added in wishlist",
                isWishlist:true
            })
         }
    }catch(err){
        return res.status(500).json({
            message:err.message
        })
    }
}

//get alll the wishlist  product of the logged in user ?


export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: "product",
        populate: {
          path: "college",
          select: "collegeName",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out items where product might have been deleted

//     product may be deleted from database
// but wishlist still contains old reference
    const filteredItems = wishlistItems.filter((item) => item.product !== null);

    return res.status(200).json({
      data: filteredItems.map((item) => item.product),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
 

export const getWishlistedIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Wishlist.find({ user: userId }).select("product");
    const ids = items.map((item) => item.product.toString());
    return res.status(200).json({ data: ids });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
