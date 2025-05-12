import { Router } from 'express';
import { crearCarpeta, eliminarImagen, obtenerCarpeta, subirImagen, upload } from '../controllers/carpeta';
import validateToken from './validateToken';

const router = Router();



// Ruta para obtener carpeta por número de documento
router.get('/api/carpeta/consultar/:numero_documento',validateToken, obtenerCarpeta);

// Ruta para crear una nueva carpeta
router.post('/api/carpeta/crear',validateToken, crearCarpeta);

// Ruta para subir una imagen a una carpeta específica
router.post('/api/carpeta/imagen/:CarpetaId',validateToken, [upload.single('imagen')], subirImagen);

// Ruta para eliminar una imagen específica de una carpeta
router.delete('/api/carpeta/imagen/:CarpetaId/:imagenId',validateToken, eliminarImagen);


export default router;