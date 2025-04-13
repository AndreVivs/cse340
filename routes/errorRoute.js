// routes/errorRoute.js
const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController"); // ✅ importar el controlador

// Error 500 route
router.get("/trigger500", errorController.triggerError);

module.exports = router;
