import { Router } from 'express';
import { enviarMensaje, obtenerFecha } from '../controllers/mensajeria';

const router = Router();
router.post("/api/mensajeria/felicitaciones", enviarMensaje);
router.get("/api/mensajeria/obtenerCumple", obtenerFecha)
export default router;