import { Router } from 'express';
import { enviarMensaje, obtenerFecha, obtenerMensaje, mensajeToFront, verificarSesion, eliminarSesion } from '../controllers/mensajeria';

const router = Router();
router.post("/api/mensajeria/felicitaciones", enviarMensaje);
router.post("/api/mensajeria/obtenerMensaje", obtenerMensaje);
router.get("/api/mensajeria/obtenerCumple", obtenerFecha);
router.get("/api/mensajeria/mensaje", mensajeToFront);
router.get("/api/mensajeria/session", verificarSesion);
router.delete("/api/mensajeria/eliminarSesion", eliminarSesion);
export default router;