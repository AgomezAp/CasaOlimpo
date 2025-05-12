"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agendaNoRegistrados_1 = require("../controllers/agendaNoRegistrados");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.get("/api/agendaNoRegistrado/obtener_citas", validateToken_1.default, agendaNoRegistrados_1.obtenerCitasNoRegistrados);
router.post("/api/agendaNoRegistrado/crear", validateToken_1.default, agendaNoRegistrados_1.crearCitaNoRegistrado);
router.patch("/api/agendaNoRegistrado/actualizar/:ANRid", validateToken_1.default, agendaNoRegistrados_1.actualizarCitaNoRegistrado);
router.delete("/api/agendaNoRegistrado/eliminar/:ANRid", validateToken_1.default, agendaNoRegistrados_1.eliminarCitaNoRegistrado);
exports.default = router;
