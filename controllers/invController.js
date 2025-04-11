const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");
const invCont = {};

/* ***************************
 *  Deliver inventory by classification view
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
    const { nav, header } = await utilities.getNav(
      res.locals.loggedin,
      res.locals.accountData
    );
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      header,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Deliver inventory item detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
      throw { status: 404, message: "Vehicle not found." };
    }
    const { nav, header } = await utilities.getNav(
      res.locals.loggedin,
      res.locals.accountData
    );
    const vehicleHtml = utilities.buildVehicleDetail(vehicle);
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      header,
      vehicleHtml,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Deliver New Classification View
 * ************************** */
invCont.buildNewClassification = async function (req, res) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );

  const classificationList = await utilities.buildClassificationList();

  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    header,
    classificationList,
    errors: null,
  });
};

/* ***************************
 *  Deliver Inventory Form View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    header,
    classificationList,
    errors: null,
  });
};

/* ***************************
 *  Deliver Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    header,
    errors: null,
    classificationList,
  });
};

/* ***************************
 *  Handle Add Classification Insertion (POST)
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      header,
      errors,
      classification_name,
    });
  }

  const result = await invModel.insertClassification(classification_name);

  if (result) {
    req.flash("notice", "Classification added successfully!");
    return res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the classification could not be added.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      header,
      notice: req.flash("notice"),
      errors: null,
      classification_name,
    });
  }
};

/* ***************************
 *  Handle Add Inventory Insertion (POST)
 * ************************** */
invCont.addInventory = async function (req, res) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );

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
    const { nav, header } = await utilities.getNav(
      res.locals.loggedin,
      res.locals.accountData
    );
    let classificationList = await utilities.buildClassificationList();
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      header,
      classificationList,
      errors: null,
      notice: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Failed to add vehicle.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      header,
      classificationList,
      errors: null,
      notice: req.flash("notice"),

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
 *  Deliver Edit Inventory View
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
  const itemData = await invModel.getInventoryById(inv_id);

  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    header,
    classificationSelect: classificationSelect,
    errors: null,
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
  });
};

/* ***************************
 *  Process Inventory Data Update
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const { nav, header } = await utilities.getNav(
    res.locals.loggedin,
    res.locals.accountData
  );
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
      header,
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
    });
  }
};

/* ***************************
 *  Deliver delete view
 * ************************** */
invCont.deleteConfirmationView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      throw { status: 404, message: "Item not found." };
    }

    const { nav, header } = await utilities.getNav(
      res.locals.loggedin,
      res.locals.accountData
    );
    res.render("./inventory/delete-confirm", {
      title: "Confirm Deletion",
      nav,
      header,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process Delete Inventory Process
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const result = await invModel.deleteInventoryItem(inv_id);

    if (result) {
      req.flash("notice", "Item deleted successfully.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Delete failed. Try again.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
