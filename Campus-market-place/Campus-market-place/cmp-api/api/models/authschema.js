import mongoose from "mongoose";
import bcrypt, { compare } from "bcrypt";

const authschema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

authschema.pre("save", async function () {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPasword = await bcrypt.hash(this.password, salt);
    this.password = hashedPasword;
  } catch (error) {
    console.log(error);
  }
});

authschema.methods.comparePassword = async function (enteredPassword) {
  console.log("running");
  const compared = await bcrypt.compare(enteredPassword, this.password);
  console.log(compared);
  return compared;
};

export const Auth = mongoose.model("Auth", authschema); // model is used to connect with db
