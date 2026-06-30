require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({ username: "admin" });

    if (exists) {
      console.log("Admin user already exists.");
      process.exit();
    }

    await User.create({
      firstName: "System",
      lastName: "Administrator",
      username: "AdminMamex",
      email: "Admin@poessa.com",
      phone: "0911111111",
      password: "Admin@123",
      role: "admin",
    });

    console.log("✅ Admin created successfully.");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();