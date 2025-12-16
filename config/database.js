const mongoose = require("mongoose");

async function connectDB() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("Missing MONGO_URI in .env");

        await mongoose.connect(uri, {
            // các option này thường không cần nữa ở mongoose mới, nhưng để cũng không sao
        });

        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
