import { Router } from 'express';
import { crearCarpeta, eliminarImagen, obtenerCarpeta, subirImagen, upload } from '../controllers/carpeta';

const router = Router();



// Ruta para obtener carpeta por número de documento
router.get('/api/carpeta/consultar/:numero_documento', obtenerCarpeta);

// Ruta para crear una nueva carpeta
router.post('/api/carpeta/crear', crearCarpeta);

// Ruta para subir una imagen a una carpeta específica
router.post('/api/carpeta/imagen/:CarpetaId', [upload.single('imagen')], subirImagen);

// Ruta para eliminar una imagen específica de una carpeta
router.delete('/api/carpeta/imagen/:CarpetaId/:imagenId', eliminarImagen);


export default router;