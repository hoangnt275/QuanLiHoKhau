const Person = require("../models/person.model");
const Family = require("../models/family.model");
const { GENDER_LABEL, RELATION_LABEL } = require("../helper/enum.helper");
const filterPersonStatusHelper = require("../helper/filterPersonStatus");
const searchStatusHelper = require("../helper/search");

// [GET] /person
module.exports.person = async (req, res) => {
    try {
        const filter = {};
        const filterStatus = filterPersonStatusHelper(req.query);
        const objectSearch = searchStatusHelper(req.query);
        if (objectSearch.regex) {
            filter.$or = [
                { fullName: objectSearch.regex },
                { cccd: objectSearch.regex },
            ];
        }
        if (req.query.status && req.query.status !== "") {
            filter.status = req.query.status;
        }
        console.log("Query:", req.query);
        console.log("Filter:", JSON.stringify(filter, null, 2));
        const persons = await Person.find(filter).populate("familyCode").lean();
        persons.forEach((person) => {
            person.genderLabel = GENDER_LABEL[person.gender] || "";
            person.relationLabel = RELATION_LABEL[person.relation];
        });
        res.render("pages/personPages/person", {
            persons: persons,
            filterStatus: filterStatus,
            pageTitle: "Trang nhân khẩu",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [GET] /person/add
module.exports.addPerson = (req, res) => {
    res.render("pages/personPages/addPerson", {
        pageTitle: "Trang nhan khau",
    });
};
// [POST] /person/add
module.exports.postAddPerson = async (req, res) => {
    try {
        const {
            fullName,
            cccd,
            gender,
            dateOfBirth,
            job,
            relation,
            familyCode,
            statusPerson,
        } = req.body;
        const family = await Family.findOne({ code: familyCode.trim() });
        if (!family) {
            return res
                .status(400)
                .send("Không tìm thấy hộ khẩu với mã: " + familyCode);
        }
        if (family.head !== null && relation === "chu_ho") {
            return res
                .status(400)
                .send(
                    "Hộ khẩu đã có chủ hộ, không thể thêm nhân khẩu với quan hệ Chủ hộ."
                );
        }
        const person = await Person.create({
            fullName: fullName?.trim(),
            cccd: cccd?.trim(),
            gender,
            dateOfBirth,
            job: job?.trim(),
            relation,
            familyCode: family._id,
            status: statusPerson,
        });
        family.members.push(person._id);
        await family.save();

        // thêm xong quay về danh sách
        return res.redirect("/person");
    } catch (err) {
        // Trùng mã hộ (unique)
        if (err.code === 11000) {
            return res
                .status(400)
                .send("CCCD đã tồn tại, vui lòng sử dụng CCCD khác.");
        }
        console.error(err);
        return res.status(500).send("Lỗi server khi thêm nhân khẩu.");
    }
};
// [GET] /person/details/:cccd
module.exports.detailPerson = async (req, res) => {
    try {
        const cccd = req.params.cccd;
        const person = await Person.findOne({ cccd: cccd })
            .populate("familyCode")
            .lean();
        if (!person) {
            return res
                .status(404)
                .send("Không tìm thấy nhân khẩu với CCCD: " + cccd);
        }

        person.genderLabel = GENDER_LABEL[person.gender] || "";
        person.relationLabel = RELATION_LABEL[person.relation];
        res.render("pages/personPages/detailPerson", {
            person: person,
            pageTitle: "Chi tiết nhân khẩu",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [GET] /person/edit/:cccd
module.exports.editPerson = async (req, res) => {
    try {
        const cccd = req.params.cccd;
        const person = await Person.findOne({ cccd: cccd }).populate(
            "familyCode"
        );
        if (person.dateOfBirth) {
            const d = new Date(person.dateOfBirth);
            person.dateOfBirthFormatted = d.toISOString().split("T")[0];
        }
        if (!person) {
            return res
                .status(404)
                .send("Không tìm thấy nhân khẩu với CCCD: " + cccd);
        }
        res.render("pages/personPages/editPerson", {
            person: person,
            pageTitle: "Chỉnh sửa nhân khẩu",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
// [POST] /person/edit/:cccd
module.exports.postEditPerson = async (req, res) => {
    try {
        const oldcccd = req.params.cccd;
        const {
            fullName,
            cccd: newcccd,
            gender,
            dateOfBirth,
            job,
            relation,
            familyCode,
            statusPerson,
        } = req.body;
        const person = await Person.findOne({ cccd: oldcccd });
        if (!person) {
            return res
                .status(404)
                .send("Không tìm thấy nhân khẩu với CCCD: " + oldcccd);
        }
        const family = await Family.findOne({ code: familyCode.trim() });
        if (!family) {
            return res
                .status(400)
                .send("Không tìm thấy hộ khẩu với mã: " + familyCode);
        }

        // Cập nhật thông tin
        person.fullName = fullName?.trim();
        person.cccd = newcccd?.trim();
        person.gender = gender;
        person.dateOfBirth = dateOfBirth;
        person.job = job?.trim();
        person.relation = relation;
        person.familyCode = family._id;
        person.status = statusPerson;
        await person.save();
        // cập nhật xong quay về danh sách
        return res.redirect("/person");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Lỗi server khi cập nhật nhân khẩu.");
    }
};
// [POST] /person/delete/:cccd
module.exports.deletePerson = async (req, res) => {
    try {
        const cccd = req.params.cccd;
        const person = await Person.findOne({ cccd: cccd });
        if (!person) {
            return res
                .status(404)
                .send("Không tìm thấy nhân khẩu với CCCD: " + cccd);
        }
        const family = await Family.findById(person.familyCode);
        if (family) {
            // Xoá nhân khẩu khỏi mảng members của hộ gia đình
            family.members = family.members.filter(
                (memberId) => memberId.toString() !== person._id.toString()
            );
            await family.save();
        }
        await Person.deleteOne({ cccd: cccd });
        // Xoá xong quay về danh sách
        return res.redirect("/person");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
