// Needed Resources
const regValidate = require("../utilities/account-validation");
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const errorController = require("../controllers/errorController");

// Página principal de la cuenta (Account Management)
router.get(
  "/",
  //utilities.checkLogin,
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
  //regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  //regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
);

// Mostrar el formulario de actualización
router.get(
  "/update/:accountId",
  //utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateForm)
);

// Actualizar datos de la cuenta
router.post(
  "/update",
  regValidate.updateAccountRules(),
  //regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Cambiar contraseña
router.post(
  "/update-password",
  regValidate.passwordChangeRules(),
  //regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updateAccountPassword)
);

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount));

// Route to intentionally trigger a 500 error
router.get("/trigger500", errorController.triggerError);

module.exports = router;
