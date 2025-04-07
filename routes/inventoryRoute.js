// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const errorController = require("../controllers/errorController");
const invValidation = require("../utilities/inventory-validation");

// Página principal del inventario
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Mostrar el formulario
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildNewClassification)
);

// Procesar el formulario
router.post(
  "/add-classification",
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Show the form
router.get("/add-inventory", invController.buildAddInventory);

// Handle the form submission
router.post(
  "/add-inventory",
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

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
