const Family = require("../models/family.model");
const Person = require("../models/person.model");
const { GENDER_LABEL, RELATION_LABEL } = require("../helper/enum.helper");
const searchStatusHelper = require("../helper/search");
const filterStatusHelper = require("../helper/filterStatus");
// [GET] /family
module.exports.family = async (req, res) => {
    try {
        const filter = {};
        const objectSearch = searchStatusHelper(req.query);
        const filterStatus = filterStatusHelper(req.query);
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (objectSearch.regex) {
            const heads = await Person.find({ fullName: objectSearch.regex })
                .select("_id")
                .lean();
            const headIds = heads.map((x) => x._id);
            filter.$or = [
                { code: objectSearch.regex },
                { address: objectSearch.regex },
                { head: { $in: headIds } },
            ];
        }
        const families = await Family.find(filter).populate("head");
        res.render("pages/familyPages/family", {
            families: families, // ✅ dữ liệu thật
            filterStatus: filterStatus,
            pageTitle: "Trang hộ khẩu",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [GET] /family/add
module.exports.addFamily = (req, res) => {
    res.render("pages/familyPages/addFamily", {
        pageTitle: "Trang ho khau",
    });
};
// [POST] /family/add
module.exports.postAddFamily = async (req, res) => {
    try {
        const {
            code,
            fullName,
            address,
            status,
            gender,
            dateOfBirth,
            statusPerson,
            job,
            cccd,
        } = req.body;

        const newFamily = await Family.create({
            code: code?.trim(),
            address: address?.trim(),
            status,
        });
        const newHeadPerson = await Person.create({
            fullName: fullName?.trim(),
            gender,
            dateOfBirth,
            relation: "chu_ho",
            status: statusPerson,
            job,
            cccd,
            familyCode: newFamily._id,
        });
        newFamily.head = newHeadPerson._id;
        newFamily.members.push(newHeadPerson._id);
        await newFamily.save();
        // thêm xong quay về danh sách
        return res.redirect("/family");
    } catch (err) {
        // Trùng mã hộ (unique)
        if (err.code === 11000) {
            return res
                .status(400)
                .send("Mã hộ đã tồn tại, vui lòng nhập mã khác.");
        }
        console.error(err);
        return res.status(500).send("Lỗi server khi thêm hộ gia đình.");
    }
};
// [GET] /family/:code
module.exports.detailFamily = async (req, res) => {
    try {
        const code = req.params.code;
        const family = await Family.findOne({ code: code })
            .populate("members")
            .populate("head");

        if (!family) {
            return res.status(404).send("Hộ gia đình không tồn tại.");
        }
        family.members.forEach((member) => {
            member.genderLabel = GENDER_LABEL[member.gender] || "";
            member.relationLabel = RELATION_LABEL[member.relation];
        });
        res.render("pages/familyPages/detailFamily", {
            family: family,
            pageTitle: "Chi tiết hộ khẩu",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [GET] /family/edit/:code
module.exports.editFamily = async (req, res) => {
    try {
        const code = req.params.code;
        const family = await Family.findOne({ code: code })
            .populate("members")
            .populate("head");

        if (!family) {
            return res.status(404).send("Hộ gia đình không tồn tại.");
        }

        res.render("pages/familyPages/editFamily", {
            family: family,
            pageTitle: "Chỉnh sửa hộ khẩu",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [POST] /family/edit/:code
module.exports.postEditFamily = async (req, res) => {
    try {
        const code = req.params.code;
        const { head, address, status } = req.body;
        const newCode = req.body.code;
        const family = await Family.findOne({ code: code });
        if (!family) {
            return res.status(404).send("Hộ gia đình không tồn tại.");
        }
        const oldHead = await Person.findOne({
            relation: "chu_ho",
            familyCode: family._id,
        });
        if (oldHead) {
            oldHead.relation = "khac";
            await oldHead.save();
        }
        const newHead = await Person.findById(head);
        if (!newHead) {
            return res.status(404).send("Chủ hộ không tồn tại.");
        }
        newHead.relation = "chu_ho";

        await newHead.save();

        family.code = newCode?.trim() || family.code;
        family.head = head;
        family.address = address?.trim();
        family.status = status;
        console.log("param code =", req.params.code);
        console.log("body =", req.body);
        await family.save();
        return res.redirect("/family");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [POST] /family/delete/:code
module.exports.deleteFamily = async (req, res) => {
    try {
        const code = req.params.code;
        const family = await Family.findOne({ code: code });
        if (!family) {
            return res.status(404).send("Hộ gia đình không tồn tại.");
        }
        // 1) xóa toàn bộ person thuộc hộ (theo family._id)
        await Person.deleteMany({ familyCode: family._id });

        // 2) xóa hộ
        await Family.deleteOne({ _id: family._id });

        return res.redirect("/family");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
