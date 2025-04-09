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
      loggedin: req.session.loggedin,
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
      loggedin: req.session.loggedin,
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
    loggedin: req.session.loggedin,
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
    loggedin: req.session.loggedin,
  });
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    notice: req.flash("notice"),
    errors: null,
    classificationList,
    loggedin: req.session.loggedin,
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
      loggedin: req.session.loggedin,
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
      loggedin: req.session.loggedin,
    });
  } else {
    req.flash("notice", "Sorry, the classification could not be added.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      notice: req.flash("notice"),
      errors: null,
      classification_name,
      loggedin: req.session.loggedin,
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

  console.log("Insert Result:", result);

  if (result) {
    req.flash("notice", "Vehicle successfully added!");
    nav = await utilities.getNav();
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      notice: req.flash("notice"),
      loggedin: req.session.loggedin,
    });
  } else {
    req.flash("notice", "Failed to add vehicle.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      notice: req.flash("notice"),
      loggedin: req.session.loggedin,
      ...req.body,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();

  const itemData = await invModel.getInventoryById(inv_id);

  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    notice: req.flash("notice"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    loggedin: req.session.loggedin,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      notice: req.flash("notice"),
      loggedin: req.session.loggedin,
    });
  }
};

/* ***************************
 *  Build delete view
 * ************************** */
invCont.deleteConfirmationView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      throw { status: 404, message: "Item not found." };
    }

    let nav = await utilities.getNav();
    res.render("./inventory/delete-confirm", {
      title: "Confirm Deletion",
      nav,
      errors: null,
      notice: req.flash("notice"),
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
      loggedin: req.session.loggedin,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Handle Delete Process
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const result = await invModel.deleteInventoryItem(inv_id);

    if (result) {
      req.flash("notice", "Item deleted successfully.");
      res.redirect("/inv/"); // Redirect to the inventory management page
    } else {
      req.flash("notice", "Delete failed. Try again.");
      res.redirect(`/inv/delete/${inv_id}`); // Re-show the confirmation page
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
