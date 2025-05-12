"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redfamiliar_1 = require("../controllers/redfamiliar");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.get('/api/paciente/:numero_documento/red-familiar', validateToken_1.default, redfamiliar_1.obtenerRedFamiliar);
router.post('/api/paciente/:numero_documento/red-familiar', validateToken_1.default, redfamiliar_1.crearMiembroRedFamiliar);
router.put('/api/paciente/red-familiar/:id', validateToken_1.default, redfamiliar_1.actualizarMiembroRedFamiliar);
router.delete('/api/paciente/red-familiar/:id', validateToken_1.default, redfamiliar_1.eliminarMiembroRedFamiliar);
router.patch('/api/paciente/red-familiar/:id/responsable', validateToken_1.default, redfamiliar_1.establecerResponsable);
exports.default = router;
