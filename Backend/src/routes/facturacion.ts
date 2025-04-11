import { Router } from 'express';
import {crearFactura, verFacturas} from '../controllers/facturacion'

const router = Router();
router.post("/api/facturacion/crearFactura", crearFactura)
router.get("/api/facturacion/reimprimir")
router.get("/api/facturacion/verFactura", verFacturas)
export default router;