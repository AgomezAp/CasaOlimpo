import { Router } from 'express';
import { enviarMensaje, obtenerFecha, obtenerMensaje } from '../controllers/mensajeria';

const router = Router();
router.post("/api/mensajeria/felicitaciones", enviarMensaje);
router.post("/api/mensajeria/obtenerMensaje", obtenerMensaje)
router.get("/api/mensajeria/obtenerCumple", obtenerFecha)
export default router;