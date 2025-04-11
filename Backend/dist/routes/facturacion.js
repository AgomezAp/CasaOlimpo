"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturacion_1 = require("../controllers/facturacion");
const router = (0, express_1.Router)();
router.post("/api/facturacion/crearFactura", facturacion_1.crearFactura);
router.get("/api/facturacion/reimprimir");
router.get("/api/facturacion/verFactura", facturacion_1.verFacturas);
exports.default = router;
