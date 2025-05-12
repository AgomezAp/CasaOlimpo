import { Router } from 'express';
import { enviarMensaje, obtenerFecha, obtenerMensaje, mensajeToFront, serverwsocket, verificarSesion, eliminarSesion, nuevaSesion } from '../controllers/mensajeria';
import validateToken from './validateToken';

const router = Router();
router.post("/api/mensajeria/felicitaciones",validateToken, enviarMensaje);
router.post("/api/mensajeria/obtenerMensaje",validateToken, obtenerMensaje);
router.get("/api/mensajeria/obtenerCumple",validateToken, obtenerFecha);
router.get("/api/mensajeria/mensaje",validateToken, mensajeToFront);
router.get("/api/mensajeria/session",validateToken, verificarSesion);
router.post("/api/mensajeria/nuevaSesion",validateToken, serverwsocket)
router.delete("/api/mensajeria/eliminarSesion",validateToken, eliminarSesion);
export default router;