import mongoose, { Schema }  from "mongoose";

const wishListSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Auth"
    } ,
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }
},{
    timestamps:true
})

// one user only can select the one product in wishlist 

wishListSchema.index({user:1,product:1},{unique:true})

export const Wishlist= mongoose.model("wishlist",wishListSchema)