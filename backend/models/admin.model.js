// models/admin.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned by default
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password; // belt & suspenders: never leak password
        delete ret.__v;
        return ret;
      },
    },
  }
);

/* -------------------------------------------------------------------------- */
/*                              Password hashing                              */
/* -------------------------------------------------------------------------- */
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* -------------------------------------------------------------------------- */
/*                              Instance methods                              */
/* -------------------------------------------------------------------------- */
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
