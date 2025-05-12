import { Router } from 'express';
import {updateConsulta, nuevaConsulta, getConsulta, getConsultasPorPaciente, getConsultasDoctor, cerrarConsulta, uploadConsentimiento, getConsentimientoPDF, getConsultaid, subirConsentimientoInformado, verificarConsentimientoInformado} from '../controllers/consulta'
import validateToken from './validateToken';
const router = Router();
// Rutas centradas en el paciente
router.post('/api/paciente/:numero_documento/consulta',validateToken, uploadConsentimiento, nuevaConsulta);
router.get('/api/paciente/:numero_documento/consultas',validateToken, getConsultasPorPaciente);
router.put('/api/paciente/:numero_documento/consulta/:Cid', validateToken,updateConsulta);
router.patch('/api/paciente/:numero_documento/consulta/:Cid/cerrar',validateToken, cerrarConsulta);
router.get('/api/paciente/:numero_documento/consulta/:Cid',validateToken, getConsulta);
// Ruta para consultas del doctor
router.get('/api/doctor/:Uid/consultas',validateToken, getConsultasDoctor);
router.get('/api/consulta/:Cid',validateToken, getConsultaid);
router.post('/api/consulta/:Cid/consentimiento',validateToken, uploadConsentimiento, subirConsentimientoInformado);
router.get('/api/consulta/:Cid/consentimiento/traer',validateToken, getConsentimientoPDF);
router.get('/api/consulta/:Cid/consentimiento/verificar',validateToken, verificarConsentimientoInformado);
export default router;