const utilities = require("../utilities/");
const baseController = {};

/* ****************************************
 *  Deliver Home view
 * *************************************** */
baseController.buildHome = async function (req, res, next) {
  try {
    const { nav, header } = await utilities.getNav(
      res.locals.loggedin,
      res.locals.accountData
    );
    res.render("index", {
      title: "Home",
      nav,
      header,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = baseController;
