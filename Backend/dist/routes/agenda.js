"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agenda_1 = require("../controllers/agenda");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.post("/api/agenda/crear", validateToken_1.default, agenda_1.crearCita);
router.patch("/api/agenda/actualizar/:Aid", validateToken_1.default, agenda_1.actualizarCita);
router.delete("/api/agenda/eliminar/:Aid", validateToken_1.default, agenda_1.eliminarCita);
router.get("/api/agenda/obtener_citas", validateToken_1.default, agenda_1.obtenerCitas);
router.get("/api/agenda/obtener_citas/:numero_documento", validateToken_1.default, agenda_1.obtenerCitasPorDoctor);
router.get('/api/agenda/:numero_documento/citas', validateToken_1.default, agenda_1.obtenerCitasPorPaciente);
router.get('/api/agenda/horas-ocupadas/:fecha', validateToken_1.default, agenda_1.getHorasOcupadas);
exports.default = router;
