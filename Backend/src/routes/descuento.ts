import { Router } from 'express';
import {obtenerDescuentos, crearDescuento, eliminarDescuento, editarDescuento} from '../controllers/descuento'
import validateToken from './validateToken';

const router = Router();
router.post("/api/descuento/crearDescuento",validateToken,crearDescuento);
router.get("/api/descuento/obtenerDescuento",validateToken, obtenerDescuentos);
router.delete("/api/descuento/eliminarDescuento/:id",validateToken, eliminarDescuento);
router.put("/api/descuento/actualizarDescuento/:id",validateToken, editarDescuento);
export default router;