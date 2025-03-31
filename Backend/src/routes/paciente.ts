import { Router } from 'express';
import { crearPaciente, obtenerPacienteId, obtenerPacientes } from '../controllers/paciente';

const router = Router();

router.post('/api/paciente/crear', crearPaciente);
router.get('/api/paciente/traer_todos',obtenerPacientes);
router.get('/api/paciente/consultar/:numero_documento', obtenerPacienteId);

export default router;