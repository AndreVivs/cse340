const utilities = require("../utilities/");
const baseController = {};

/* ****************************************
 *  Deliver Home view
 * *************************************** */
baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("index", {
      title: "Home",
      nav,
      loggedin: req.session.loggedin,
      accountData: req.session.accountData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = baseController;
