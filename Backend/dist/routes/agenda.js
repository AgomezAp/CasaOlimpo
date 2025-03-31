"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agenda_1 = require("../controllers/agenda");
const router = (0, express_1.Router)();
router.post("/api/agenda/crear", agenda_1.crearCita);
router.patch("/api/agenda/actualizar/:id", agenda_1.actualizarCita); // Cambia esto según la lógica de actualización que necesites
router.delete("/api/agenda/eliminar/:id", agenda_1.eliminarCita);
router.get("/api/agenda/obtener_citas", agenda_1.obtenerCitas); // Cambia esto según la lógica de consulta que necesites
router.get("/api/agenda/obtener_citas/:numero_documento", agenda_1.obtenerCitas); // Cambia esto según la lógica de consulta que necesites
exports.default = router;
