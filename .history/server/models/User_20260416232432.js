const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email",
      ],
      maxlength: [100, "Email cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter valid 10-digit Indian phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["buyer", "seller", "admin"],
        message: "Role must be buyer, seller or admin",
      },
      required: [true, "Role is required"],
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      default: "",
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      default: "",
      match: [/^$|^[1-9][0-9]{5}$/, "Enter valid 6-digit Indian pincode"],
    },
    lat: {
      type: Number,
      default: null,
      min: [-90, "Invalid latitude"],
      max: [90, "Invalid latitude"],
    },
    lng: {
      type: Number,
      default: null,
      min: [-180, "Invalid longitude"],
      max: [180, "Invalid longitude"],
    },
    hasLocation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
