const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fee",
        required: true,
    },
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
        required: true,
    },
    paidFamily: {
        type: String,
        required: true,
    },
    paidValue: {
        type: Number,
        required: true,
    },
    paidDate: {
        type: Date,
        required: true,
    },
    debitValue: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Đã đóng", "Chưa đóng", "Đóng một phần"],
        default: "Chưa đóng",
    },
});

module.exports = mongoose.model("Payment", PaymentSchema);
