"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paciente_1 = require("../controllers/paciente");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.post("/api/paciente/crear", validateToken_1.default, paciente_1.crearPaciente);
router.get("/api/paciente/traer_todos", validateToken_1.default, paciente_1.obtenerPacientes);
router.get("/api/paciente/consultar/:numero_documento", validateToken_1.default, paciente_1.obtenerPacienteId);
router.patch("/api/paciente/actualizar/:numero_documento", validateToken_1.default, paciente_1.actualizarDatosPaciente);
router.post("/api/paciente/:numero_documento/foto", validateToken_1.default, [paciente_1.uploadPacienteFoto.single("foto")], paciente_1.actualizarFotoPaciente);
router.delete('/api/paciente/:numero_documento/foto', validateToken_1.default, paciente_1.eliminarFotoPaciente);
router.get('/api/paciente/:numero_documento/foto', validateToken_1.default, paciente_1.obtenerFotoPaciente);
router.get('/api/doctor/:Uid/pacientes', validateToken_1.default, paciente_1.obtenerPacientesPorDoctor);
router.post('/api/paciente/:numero_documento/transferir', paciente_1.transferirPaciente);
exports.default = router;
