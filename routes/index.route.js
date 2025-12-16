const dashboardRoutes = require("./dashboard.route");
const familyRoutes = require("./family.route");
const personRoutes = require("./person.route");
module.exports = (app) => {
    app.use("/dashboard", dashboardRoutes);
    app.use("/family", familyRoutes);
    app.use("/person", personRoutes);
};
