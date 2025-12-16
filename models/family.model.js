const mongoose = require("mongoose");

const FamilySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },

    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
    },
    address: {
        type: String,
        required: true,
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
        },
    ],

    status: {
        type: String,
        enum: ["Đang quản lý", "Tạm khóa", "Đã hủy"],
        default: "Đang quản lý",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    displayStatus: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Family", FamilySchema);
