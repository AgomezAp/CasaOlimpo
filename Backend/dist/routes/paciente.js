"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paciente_1 = require("../controllers/paciente");
const router = (0, express_1.Router)();
router.post("/api/paciente/crear", paciente_1.crearPaciente);
router.get("/api/paciente/traer_todos", paciente_1.obtenerPacientes);
router.get("/api/paciente/consultar/:numero_documento", paciente_1.obtenerPacienteId);
exports.default = router;
