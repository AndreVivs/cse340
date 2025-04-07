const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

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

/* ***************************
 *  Deliver Inventory Form View
 * ************************** */
invCont.buildNewClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    notice: req.flash("notice"),
    errors: null,
  });
};

/* ***************************
 *  Deliver Inventory Form View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    notice: req.flash("notice"),
    classificationList,
    errors: null,
  });
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    notice: req.flash("notice"),
    errors: null,
  });
};

/* ***************************
 *  Handle POST classification insertion
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
  }

  const result = await invModel.insertClassification(classification_name);

  if (result) {
    req.flash("notice", "Classification added successfully!");
    const nav = await utilities.getNav(); // updated nav with new classification
    return res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      notice: req.flash("notice"),
      errors: null,
      message: "Classification added successfully!",
    });
  } else {
    req.flash("notice", "Sorry, the classification could not be added.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      notice: req.flash("notice"),
      errors: null,
      classification_name,
    });
  }
};

// Handle form POST
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const result = await invModel.addInventoryItem(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (result) {
    req.flash("notice", "Vehicle successfully added!");
    nav = await utilities.getNav();
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      notice: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Failed to add vehicle.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      notice: req.flash("notice"),
      ...req.body,
    });
  }
};

module.exports = invCont;
