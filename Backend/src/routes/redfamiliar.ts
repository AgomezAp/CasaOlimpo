import { Router } from 'express';
import { actualizarMiembroRedFamiliar, crearMiembroRedFamiliar, eliminarMiembroRedFamiliar, establecerResponsable, obtenerRedFamiliar } from '../controllers/redfamiliar';

const router = Router();

router.get('/api/paciente/:numero_documento/red-familiar', obtenerRedFamiliar);
router.post('/api/paciente/:numero_documento/red-familiar', crearMiembroRedFamiliar);
router.put('/api/paciente/red-familiar/:id', actualizarMiembroRedFamiliar);
router.delete('/api/paciente/red-familiar/:id', eliminarMiembroRedFamiliar);
router.patch('/api/paciente/red-familiar/:id/responsable', establecerResponsable);


export default router;