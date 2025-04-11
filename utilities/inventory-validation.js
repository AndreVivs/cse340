const inventoryModel = require("../models/inventory-model");
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

// /* ***********************************
//  *  Classification Validation Rules
//  * ********************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("No spaces or special characters allowed."),
  ];
};

// /* ***********************************
//  *  Errors Validation Rules
//  * ********************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  let nav = await require("../utilities").getNav();

  if (!errors.isEmpty()) {
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .matches(/^\d+$/)
      .withMessage("Price must be a whole number without dots or commas."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors,
      ...req.body,
    });
    return;
  }
  next();
};

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      classificationList,
      errors,
      inv_id: req.params.inv_id,
      ...req.body,
    });
    return;
  }
  next();
};

module.exports = validate;
