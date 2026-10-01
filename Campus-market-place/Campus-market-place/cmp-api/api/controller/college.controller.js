import { College } from "../models/college.schema.js";

export const createCollege = async (req, res, next) => {
  try {
    const { collegeName, address } = req.body;

    if (!collegeName || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isAdminExist=await College.findOne({admin:req.user.id})
    if(isAdminExist){
      return res.status(400).json({
        message:"Admin can create only one college "
      })
    }


const isCollegeExist= await College.findOne({ collegeName: collegeName})

  if(isCollegeExist){
      return res.status(400).json({
        message:" college is already exist  "
      })
    }



    const college = await College.create({
      collegeName,
      address,
      admin:req.user.id
    });

    return res.status(201).json({
      success: true,
      message: "College created successfully",
      college,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// get college    


export const getCollege= async(req,res,next)=>{
  try{
    const college = await College.find({ });

    if(!College||!College.length===0){
      return res.status(400).json({
        message:"no colllege found"
      })
    }

    return res.status(200).json({
     data:college
    })
  }
  catch(err){
    return res.status(500).json({
      message:err.message
    })
  }
}