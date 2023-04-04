const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    group: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    }
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);
  return match;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
