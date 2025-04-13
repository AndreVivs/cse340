// Needed Resources
const regValidate = require("../utilities/account-validation");
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");

// Home (Account Management)
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Route to handle "My Account" page request
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to handle Registration page request
router.get(
  "/registration",
  utilities.handleErrors(accountController.buildRegister)
);

// Process the registration data
router.post(
  "/registration",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
);

// Show update form
router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateForm)
);

// Update Account Information
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Change Password
router.post(
  "/update-password",
  regValidate.passwordChangeRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updateAccountPassword)
);

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount));

module.exports = router;
