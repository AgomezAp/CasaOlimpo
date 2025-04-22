import { Router } from 'express';
import {obtenerDescuentos, crearDescuento, eliminarDescuento, editarDescuento} from '../controllers/descuento'

const router = Router();
router.post("/api/descuento/crearDescuento",crearDescuento);
router.get("/api/descuento/obtenerDescuento", obtenerDescuentos);
router.delete("/api/descuento/eliminarDescuento/:id", eliminarDescuento);
router.put("/api/descuento/actualizarDescuento/:id", editarDescuento);
export default router;