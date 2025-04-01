const errorController = {};

/* ***************************
 *  Intentional 500 Error Route
 * ************************** */
errorController.triggerError = async function (req, res, next) {
  try {
    throw new Error("Intentional Server Error - This is a test.");
  } catch (error) {
    next(error);
  }
};

module.exports = errorController;
