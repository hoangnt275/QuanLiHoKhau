const Family = require("../models/family.model");
const Person = require("../models/person.model");
const Fee = require("../models/fee.model");
const Payment = require("../models/payment.model");

const searchStatusHelper = require("../helper/search");
const filterTypeHelper = require("../helper/filterFeeType");

// [GET] /fee
module.exports.fee = async (req, res) => {
    const filter = {};
    const objectSearch = searchStatusHelper(req.query);
    const filterType = filterTypeHelper(req.query);
    const countFamilies = await Family.countDocuments();
    if (objectSearch.regex) {
        filter.$or = [
            { codeFee: objectSearch.regex },
            { name: objectSearch.regex },
        ];
    }
    if (req.query.type) {
        filter.$or = [{ type: req.query.type }, { status: req.query.type }];
    }
    console.log(filter);
    const fees = await Fee.find(filter);
    for (const fee of fees) {
        if (fee.type === "Bắt buộc") {
            const paidCount = fee.paidFamilies?.length || 0;

            if (paidCount === 0) {
                fee.status = "Đang thu";
            } else if (paidCount === countFamilies) {
                fee.status = "Hoàn thành";
            }

            await fee.save();
        }
    }
    res.render("pages/feePages/fee", {
        pageTitle: "Trang khoản phí",
        filterType,
        // filterStatus,
        fees: fees,
    });
};
// [GET] /fee/add
module.exports.addFee = (req, res) => {
    res.render("pages/feePages/addFee", {
        pageTitle: "Thêm khoản phí mới",
    });
};
// [POST] /fee/add
module.exports.postAddFee = async (req, res) => {
    const { codeFee, name, value, cycle, type } = req.body;
    const newFee = new Fee({
        codeFee,
        name,
        value,
        cycle,
        type,
        paidFamilies: [],
        status: "Đang thu",
    });
    await newFee.save();
    res.redirect("/fee");
};
// [GET] /fee/:feeCode
module.exports.detailFee = async (req, res) => {
    const { feeCode } = req.params;
    const countFamilies = await Family.countDocuments();
    const fee = await Fee.findOne({ codeFee: feeCode }).populate({
        path: "paidFamilies",
        populate: {
            path: "head",
        },
    });
    if (countFamilies === fee.paidFamilies.length) {
        fee.status = "Hoàn thành";
        await fee.save();
    } else {
        fee.status = "Đang thu";
        await fee.save();
    }
    res.render("pages/feePages/detailFee", {
        pageTitle: "Chi tiết khoản phí",
        countFamilies,
        fee: fee,
    });
};
// [GET] /fee/edit/:feeCode
module.exports.editFee = async (req, res) => {
    const { feeCode } = req.params;
    const fee = await Fee.findOne({ codeFee: feeCode });
    res.render("pages/feePages/editFee", {
        pageTitle: "Chỉnh sửa khoản phí",
        fee: fee,
    });
};
// [POST] /fee/edit/:feeCode
module.exports.postEditFee = async (req, res) => {
    const { feeCode } = req.params;
    const { codeFee, name, value, cycle, type, status } = req.body;
    await Fee.updateOne(
        { codeFee: feeCode },
        { codeFee, name, value, cycle, type, status }
    );
    res.redirect("/fee");
};
// [POST] /fee/delete/:feeCode
module.exports.deleteFee = async (req, res) => {
    const { feeCode } = req.params;
    const fee = await Fee.findOne({ codeFee: feeCode });
    await Payment.deleteMany({ fee: fee._id });
    await Fee.deleteOne({ codeFee: feeCode });
    res.redirect("/fee");
};
// [GET] /fee/api/fee/by-code/:code
module.exports.getFeeByCode = async (req, res) => {
    const codeFee = req.params.code;
    const fee = await Fee.findOne({ codeFee });
    if (!fee) {
        return res.status(404).json({ message: "Không tìm thấy khoản phí" });
    }

    res.status(200).json(fee);
};
