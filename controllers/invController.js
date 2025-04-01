const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    if (!data || data.length === 0) {
      throw {
        status: 404,
        message: "No vehicles found in this classification.",
      };
    }
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
      throw { status: 404, message: "Vehicle not found." };
    }
    let nav = await utilities.getNav();
    const vehicleHtml = utilities.buildVehicleDetail(vehicle);
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
