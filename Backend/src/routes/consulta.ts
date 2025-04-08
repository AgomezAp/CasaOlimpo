import { Router } from 'express';
import {updateConsulta, nuevaConsulta, getConsulta, getConsultasPorPaciente, getConsultasDoctor, cerrarConsulta, uploadConsentimiento, getConsentimientoPDF} from '../controllers/consulta'
const router = Router();
// Rutas centradas en el paciente
router.post('/api/paciente/:numero_documento/consulta', uploadConsentimiento, nuevaConsulta);
router.get('/api/paciente/:numero_documento/consultas', getConsultasPorPaciente);
router.put('/api/paciente/:numero_documento/consulta/:Cid', updateConsulta);
router.patch('/api/paciente/:numero_documento/consulta/:Cid/cerrar', cerrarConsulta);
router.get('/api/consulta/:Cid', getConsulta);
// Ruta para consultas del doctor
router.get('/api/doctor/:Uid/consultas', getConsultasDoctor);

router.get('/api/consulta/:Cid/consentimiento', getConsentimientoPDF);
export default router;