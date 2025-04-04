import { Router } from 'express';
import { completarReceta, crearReceta, editarReceta, obtenerRecetas, obtenerRecetasActivas, obtenerRecetasPorPaciente } from '../controllers/receta';

const router = Router();


router.get('/api/paciente/recetas/obtenerRecetas', obtenerRecetas);
router.get('/api/paciente/:numero_documento/recetas/activas', obtenerRecetasActivas);
router.post('/api/paciente/:numero_documento/recetas/crear', crearReceta);
router.put('/api/paciente/recetas/:RecetaId', editarReceta);

router.patch('/api/paciente/recetas/:RecetaId/completar', completarReceta);

router.get('/api/paciente/:numero_documento/recetas/obtener-paciente', obtenerRecetasPorPaciente);

export default router;