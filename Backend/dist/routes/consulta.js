"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consulta_1 = require("../controllers/consulta");
const router = (0, express_1.Router)();
// Rutas centradas en el paciente
router.post('/api/paciente/:numero_documento/consulta', consulta_1.uploadConsentimiento, consulta_1.nuevaConsulta);
router.get('/api/paciente/:numero_documento/consultas', consulta_1.getConsultasPorPaciente);
router.put('/api/paciente/:numero_documento/consulta/:Cid', consulta_1.updateConsulta);
router.patch('/api/paciente/:numero_documento/consulta/:Cid/cerrar', consulta_1.cerrarConsulta);
// Ruta para consultas del doctor
router.get('/api/doctor/:Uid/consultas', consulta_1.getConsultasDoctor);
exports.default = router;
