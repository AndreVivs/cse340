// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const errorController = require("../controllers/errorController");

// Route to handle "My Account" page request
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to handle Registration page request
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Route to intentionally trigger a 500 error
router.get("/trigger500", errorController.triggerError);

module.exports = router;
