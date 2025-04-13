// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidation = require("../utilities/inventory-validation");

// Home (Management View)
router.get(
  "/",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
);

// JSON route to get inventory by classification_id
router.get(
  "/getInventory/:classification_id",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
);

// Show add classification form
router.get(
  "/add-classification",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildNewClassification)
);

// Handle add classification form
router.post(
  "/add-classification",
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.addClassification)
);

// Show add inventory - vehicle form
router.get("/add-inventory", invController.buildAddInventory);

// Handle the form submission
router.post(
  "/add-inventory",
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.addInventory)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to display inventory item details
router.get(
  "/detail/:invId",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildInventoryDetail)
);

// Route to build edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);

// Route to build edit classification view
router.post(
  "/update",
  invValidation.inventoryRules(),
  invValidation.checkUpdateData,
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build delete view
router.get(
  "/delete/:inv_id",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteConfirmationView)
);

// Route to delete inventory item
router.post(
  "/delete/:inv_id",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);

// Route to delete classification by ID
router.get(
  "/can-delete-classification/:classification_id",
  utilities.handleErrors(invController.canDeleteClassification)
);

// Route to delete classification by ID
router.post(
  "/delete-classification/:classification_id",
  utilities.handleErrors(invController.deleteClassification)
);

router.get(
  "/dashboard",
  utilities.checkLogin,
  utilities.checkAccountType(["Admin"]),
  utilities.handleErrors(invController.showDashboard)
);

module.exports = router;
