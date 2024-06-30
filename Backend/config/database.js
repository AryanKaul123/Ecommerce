const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "Backend/config/config.env" });

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL)
        .then(() => {
            console.log("Database connected successfully");
        })
        .catch((error) => {
            console.error("Error connecting to database:", error);
        });
};

module.exports = connectDatabase;
