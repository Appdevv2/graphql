const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];

    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-Mail is invalid." });
    }

    if (
      !validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password)
    ) {
      errors.push({ message: "Password to short" });
    }

    if (errors.length > 0) {
    }

    const existingUser = await User.findOne({ email: userInput.email });

    if (existingUser) {
      const error = new Error("User already exist");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);

    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};
