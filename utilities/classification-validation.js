const { body, validationResult } = require("express-validator");
// const { body, validationResult } = require("express-validator");
// const accountModel = require("../models/account-model");
// const utilities = require(".");

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage(
        "Classification must not contain spaces or special characters."
      ),
  ];
};

const checkClassificationData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.errors = errors;
  }
  next();
};

module.exports = { classificationRules, checkClassificationData };
