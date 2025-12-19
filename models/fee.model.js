const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema({
    codeFee: {
        type: String,
        required: true,
        unique: true,
    },

    name: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },

    cycle: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["Bắt buộc", "Tự nguyện"],
        default: "Bắt buộc",
    },
    paidFamilies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family",
        },
    ],
    status: {
        type: String,
        enum: ["Hoàn thành", "Đang thu", "Đã hủy"],
        default: "Đang thu",
    },
});

module.exports = mongoose.model("Fee", FeeSchema);
