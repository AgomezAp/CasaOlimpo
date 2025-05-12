"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consulta_1 = require("../controllers/consulta");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
// Rutas centradas en el paciente
router.post('/api/paciente/:numero_documento/consulta', validateToken_1.default, consulta_1.uploadConsentimiento, consulta_1.nuevaConsulta);
router.get('/api/paciente/:numero_documento/consultas', validateToken_1.default, consulta_1.getConsultasPorPaciente);
router.put('/api/paciente/:numero_documento/consulta/:Cid', validateToken_1.default, consulta_1.updateConsulta);
router.patch('/api/paciente/:numero_documento/consulta/:Cid/cerrar', validateToken_1.default, consulta_1.cerrarConsulta);
router.get('/api/paciente/:numero_documento/consulta/:Cid', validateToken_1.default, consulta_1.getConsulta);
// Ruta para consultas del doctor
router.get('/api/doctor/:Uid/consultas', validateToken_1.default, consulta_1.getConsultasDoctor);
router.get('/api/consulta/:Cid', validateToken_1.default, consulta_1.getConsultaid);
router.post('/api/consulta/:Cid/consentimiento', validateToken_1.default, consulta_1.uploadConsentimiento, consulta_1.subirConsentimientoInformado);
router.get('/api/consulta/:Cid/consentimiento/traer', validateToken_1.default, consulta_1.getConsentimientoPDF);
router.get('/api/consulta/:Cid/consentimiento/verificar', validateToken_1.default, consulta_1.verificarConsentimientoInformado);
exports.default = router;
