import { Router } from 'express';
import {crearFactura, verFacturas, facturaById} from '../controllers/facturacion'

const router = Router();
router.post("/api/facturacion/crearFactura", crearFactura)
router.get("/api/facturacion/facturas", facturaById)
router.get("/api/facturacion/verFactura", verFacturas)
export default router;