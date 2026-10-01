import { Auth } from "../models/authschema.js";
import { College } from "../models/college.schema.js";
import { getToken } from "../../utl/gettoken.js";

// SIGNUP
export const signup = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      college,
      isVerified,
      role,
    } = req.body;

    // validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    // check existing user
    const isUserExist = await Auth.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        message: "user already exist",
      });
    }

    // create user
    const user = await Auth.create({
      username,
      email,
      password,
      college,
      isVerified,
      role,
    });

    return res.status(201).json({
      id: user._id,
      message: "registered successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// SIGNIN
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    // find user
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    // compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "password is incorrect",
      });
    }

    // check verification
    if (user.isVerified === false) {
      return res.status(400).json({
        message: "you can sign in once the admin has verified you",
      });
    }

    // generate token
    const token = await getToken(
      user._id,
      user.role,
      user.college ? user.college : null,
    );

    if (!token) {
      return res.status(400).json({
        message: "token not found",
      });
    }

    // send response
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "signin successfully",
        id: user._id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          college: user.college,
          isVerified: user.isVerified,
        },
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// GET ALL USERS
export const getAllusers = async (req, res, next) => {
  try {
    // find admin's college
    const college = await College.findOne({
      admin: req.user.id,
    });

    if (!college) {
      return res.status(404).json({
        message: "college not found",
      });
    }

    // find users
    const users = await Auth.find({
      role: "user",
      college: college._id,
    }).select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "no users found",
      });
    }

    return res.status(200).json({
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// VERIFY USER
export const isVerifiedUser = async (req, res, next) => {
  try {
    const updatedUser = await Auth.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isVerified: true,
        },
      },
      {
        new: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "user verified successfully",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// GET CURRENT USER
export const getUser = async (req, res, next) => {
  try {
    const user = await Auth.findById(req.user.id)
      .populate("college")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// SIGNOUT
export const signout = async (req, res) => {
  try {
    return res.clearCookie("token").status(200).json({
      message: "signout successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await Auth.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          username,
        },
      },
      {
        new: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "profile updated successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};