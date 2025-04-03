// Needed Resources
const regValidate = require("../utilities/account-validation");
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const errorController = require("../controllers/errorController");

// Route to handle "My Account" view page request
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to handle Registration view page request
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Route to handle Registration post request
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Route to intentionally trigger a 500 error
router.get("/trigger500", errorController.triggerError);

module.exports = router;
