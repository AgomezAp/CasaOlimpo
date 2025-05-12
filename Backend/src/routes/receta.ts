import { Router } from 'express';
import { completarReceta, crearReceta, editarReceta, obtenerRecetas, obtenerRecetasActivas, obtenerRecetasPorPaciente } from '../controllers/receta';
import validateToken from './validateToken';

const router = Router();


router.get('/api/paciente/recetas/obtenerRecetas',validateToken, obtenerRecetas);
router.get('/api/paciente/:numero_documento/recetas/activas',validateToken, obtenerRecetasActivas);
router.post('/api/paciente/:numero_documento/recetas/crear',validateToken, crearReceta);
router.put('/api/paciente/recetas/:RecetaId', validateToken, editarReceta);

router.patch('/api/paciente/recetas/:RecetaId/completar',validateToken, completarReceta);

router.get('/api/paciente/:numero_documento/recetas/obtener-paciente',validateToken, obtenerRecetasPorPaciente);

export default router;