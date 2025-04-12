// routes/errorRoute.js
const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController"); // ✅ importar el controlador

// Ruta que dispara un error 500 a propósito
router.get("/trigger500", errorController.triggerError);

module.exports = router;
