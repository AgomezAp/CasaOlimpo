import { Router } from 'express';
import { actualizarMiembroRedFamiliar, crearMiembroRedFamiliar, eliminarMiembroRedFamiliar, establecerResponsable, obtenerRedFamiliar } from '../controllers/redfamiliar';
import validateToken from './validateToken';

const router = Router();

router.get('/api/paciente/:numero_documento/red-familiar',validateToken, obtenerRedFamiliar);
router.post('/api/paciente/:numero_documento/red-familiar',validateToken, crearMiembroRedFamiliar);
router.put('/api/paciente/red-familiar/:id',validateToken, actualizarMiembroRedFamiliar);
router.delete('/api/paciente/red-familiar/:id',validateToken, eliminarMiembroRedFamiliar);
router.patch('/api/paciente/red-familiar/:id/responsable',validateToken, establecerResponsable);


export default router;