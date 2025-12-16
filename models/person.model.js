const mongoose = require("mongoose");

const PersonSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    cccd: {
        type: String,
        required: true,
        unique: true,
    },

    gender: {
        type: String,
        enum: ["nam", "nu", "khac"],
    },

    dateOfBirth: {
        type: Date,
        required: true,
    },

    job: String,

    relation: {
        type: String,
        enum: ["chu_ho", "vo", "chong", "con", "khac"],
    },

    familyCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Family",
    },

    status: {
        type: String,
        enum: ["Thường trú", "Tạm trú", "Tạm vắng"],
        default: "Thường trú",
    },
    displayStatus: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Person", PersonSchema);
