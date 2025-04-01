// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const errorController = require("../controllers/errorController");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to display inventory item details
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildInventoryDetail)
);

// Route to intentionally trigger a 500 error
router.get("/trigger500", errorController.triggerError);

module.exports = router;
