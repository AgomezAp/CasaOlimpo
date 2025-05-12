"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const receta_1 = require("../controllers/receta");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.get('/api/paciente/recetas/obtenerRecetas', validateToken_1.default, receta_1.obtenerRecetas);
router.get('/api/paciente/:numero_documento/recetas/activas', validateToken_1.default, receta_1.obtenerRecetasActivas);
router.post('/api/paciente/:numero_documento/recetas/crear', validateToken_1.default, receta_1.crearReceta);
router.put('/api/paciente/recetas/:RecetaId', validateToken_1.default, receta_1.editarReceta);
router.patch('/api/paciente/recetas/:RecetaId/completar', validateToken_1.default, receta_1.completarReceta);
router.get('/api/paciente/:numero_documento/recetas/obtener-paciente', validateToken_1.default, receta_1.obtenerRecetasPorPaciente);
exports.default = router;
