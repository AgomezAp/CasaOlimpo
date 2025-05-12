import { Router } from 'express';
import {updateConsulta, nuevaConsulta, getConsulta, getConsultasPorPaciente, getConsultasDoctor, cerrarConsulta, uploadConsentimiento, getConsentimientoPDF, getConsultaid, subirConsentimientoInformado, verificarConsentimientoInformado} from '../controllers/consulta'
const router = Router();
// Rutas centradas en el paciente
router.post('/api/paciente/:numero_documento/consulta', uploadConsentimiento, nuevaConsulta);
router.get('/api/paciente/:numero_documento/consultas', getConsultasPorPaciente);
router.put('/api/paciente/:numero_documento/consulta/:Cid', updateConsulta);
router.patch('/api/paciente/:numero_documento/consulta/:Cid/cerrar', cerrarConsulta);
router.get('/api/paciente/:numero_documento/consulta/:Cid', getConsulta);
// Ruta para consultas del doctor
router.get('/api/doctor/:Uid/consultas', getConsultasDoctor);
router.get('/api/consulta/:Cid', getConsultaid);
router.post('/api/consulta/:Cid/consentimiento', uploadConsentimiento, subirConsentimientoInformado);
router.get('/api/consulta/:Cid/consentimiento/traer', getConsentimientoPDF);
router.get('/api/consulta/:Cid/consentimiento/verificar', verificarConsentimientoInformado);
export default router;