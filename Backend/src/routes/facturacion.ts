import { Router } from 'express';
import {crearFactura, verFacturas, facturaById} from '../controllers/facturacion'
import validateToken from './validateToken';

const router = Router();
router.post("/api/facturacion/crearFactura",validateToken, crearFactura)
router.get("/api/facturacion/facturas",validateToken, facturaById)
router.get("/api/facturacion/verFactura",validateToken, verFacturas)
export default router;