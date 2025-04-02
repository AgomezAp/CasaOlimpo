import { Router } from 'express';
import { completarReceta, crearReceta, editarReceta, obtenerRecetas, obtenerRecetasActivas } from '../controllers/receta';

const router = Router();


router.get('/api/paciente/recetas/obtenerRecetas', obtenerRecetas);
router.get('/api/paciente/recetas/activas/:numero_documento', obtenerRecetasActivas);
router.post('/api/paciente/recetas/crear', crearReceta);
router.put('/api/paciente/recetas/:RecetaId', editarReceta);
router.patch('/api/paciente/recetas/:RecetaId/completar', completarReceta);

export default router;