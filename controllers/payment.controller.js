const Family = require("../models/family.model");
const Person = require("../models/person.model");
const Payment = require("../models/payment.model");
const Fee = require("../models/fee.model");
const { RELATION_LABEL } = require("../helper/enum.helper");
const filterStatusHelper = require("../helper/filterPaymentStatus");
const searchStatusHelper = require("../helper/search");

// [GET] /payment
module.exports.payment = async (req, res) => {
    filter = {};
    const payments = await Payment.find().populate("fee").populate("payer");
    const filterStatus = filterStatusHelper(req.query);
    const objectSearch = searchStatusHelper(req.query);

    await Promise.all(
        payments.map((payment) => {
            const paid = Number(payment.paidValue);
            if (isNaN(paid)) return Promise.resolve();

            const debitValue = payment.fee.value - paid;
            const status = debitValue > 0 ? "Đóng một phần" : "Đã đóng";

            return payment.updateOne({ debitValue, status });
        })
    );
    if (req.query.status) {
        filter.$or = [{ status: req.query.status }];
    }
    const updatedPayments = await Payment.find(filter)
        .populate("fee")
        .populate("payer")
        .lean();
    res.render("pages/paymentPages/payment", {
        pageTitle: "Trang lượt đóng phí",
        filterStatus,
        payments: updatedPayments,
    });
};
// [GET] /payment/add
module.exports.addPayment = (req, res) => {
    res.render("pages/paymentPages/addPayment", {
        pageTitle: "Thêm lượt đóng phí mới",
    });
};
// [POST] /payment/add
module.exports.postAddPayment = async (req, res) => {
    const { codeFee, cccdPayer, paidValue, paidDate } = req.body;
    const fee = await Fee.findOne({ codeFee });
    const payer = await Person.findOne({ cccd: cccdPayer }).populate(
        "familyCode"
    );

    if (!fee) {
        return res.status(400).json({ message: "Không tìm thấy khoản phí" });
    }

    if (!payer) {
        return res
            .status(400)
            .json({ message: "Không tìm thấy người nộp phí" });
    }
    const paidFamily = payer.familyCode.code;
    const paid = Number(paidValue);
    if (isNaN(paid)) {
        return res
            .status(400)
            .json({ message: "Số tiền đã đóng không hợp lệ" });
    }
    const debitValue = fee.value - paid;
    let status = "Đã đóng";
    if (debitValue > 0) {
        status = "Đóng một phần";
    } else {
        fee.paidFamilies.addToSet(payer.familyCode);
    }
    await fee.save();
    const newPayment = new Payment({
        fee: fee._id,
        payer: payer._id,
        paidValue,
        paidDate,
        debitValue,
        paidFamily,
        status,
    });
    await newPayment.save();
    res.redirect("/payment");
};
// [GET] /payment/:_id
module.exports.detailPayment = async (req, res) => {
    const _id = req.params._id;
    const payment = await Payment.findOne({ _id })
        .populate("fee")
        .populate({
            path: "payer", // Payment -> Person
            populate: {
                path: "familyCode", // Person -> Family
            },
        })
        .lean();
    payment.payer.relation =
        RELATION_LABEL[String(payment.payer.relation)] || "";
    payment.debitValue = Number(payment.debitValue);
    console.log(payment.payer.relation);
    res.render("pages/paymentPages/detailPayment", {
        pageTitle: "Trang chi tiết lượt đóng phí",
        payment: payment,
    });
};
// [GET] /payment/edit/:_id
module.exports.editPayment = async (req, res) => {
    const { _id } = req.params;
    const payment = await Payment.findOne({ _id })
        .populate("fee")
        .populate("payer");
    payment.paidDateInput = payment.paidDate
        ? new Date(payment.paidDate).toISOString().slice(0, 10)
        : "";
    res.render("pages/paymentPages/editPayment", {
        pageTitle: "Chỉnh sửa lượt đóng phí",
        payment,
    });
};
// [POST] /payment/edit/:_id
module.exports.postEditPayment = async (req, res) => {
    const { _id } = req.params;
    const { codeFee, cccdPayer, paidValue, paidDate } = req.body;
    const fee = await Fee.findOne({ codeFee });
    const payer = await Person.findOne({ cccd: cccdPayer });
    const paid = Number(paidValue);
    if (isNaN(paid)) {
        return res
            .status(400)
            .json({ message: "Số tiền đã đóng không hợp lệ" });
    }
    const debitValue = fee.value - paid;
    let status = "Đã đóng";
    if (debitValue > 0) {
        status = "Đóng một phần";
    } else {
        fee.paidFamilies.addToSet(payer.familyCode);
    }
    await fee.save();
    await Payment.updateOne(
        { _id },
        {
            fee: fee._id,
            payer: payer._id,
            paidValue,
            paidDate,
            debitValue,
            status,
        }
    );
    res.redirect("/payment");
};
// [POST] /payment/delete/:_id
module.exports.deletePayment = async (req, res) => {
    const { _id } = req.params;
    await Payment.deleteOne({ _id });
    res.redirect("/payment");
};
