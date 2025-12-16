const Family = require("../models/family.model");
const Person = require("../models/person.model");

// [GET] /dashboard
module.exports.dashboard = async (req, res) => {
    try {
        const [householdsCount, populationCount] = await Promise.all([
            Family.countDocuments({}),
            Person.countDocuments({}),
        ]);

        res.render("pages/dashboard", {
            pageTitle: "Trang tong quan",
            householdsCount,
            populationCount,
        });
    } catch (err) {
        console.error(err);
        res.render("pages/dashboard", {
            pageTitle: "Trang tong quan",
            householdsCount: 0,
            populationCount: 0,
        });
    }
};
