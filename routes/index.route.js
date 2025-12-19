const dashboardRoutes = require("./dashboard.route");
const familyRoutes = require("./family.route");
const personRoutes = require("./person.route");
const feeRoutes = require("./fee.route");
const paymentRoutes = require("./payment.route");
module.exports = (app) => {
    app.use("/dashboard", dashboardRoutes);
    app.use("/family", familyRoutes);
    app.use("/person", personRoutes);
    app.use("/fee", feeRoutes);
    app.use("/payment", paymentRoutes);
};
