"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consulta_1 = require("../controllers/consulta");
const router = (0, express_1.Router)();
router.post("/api/consulta/crear", consulta_1.nuevaConsulta);
router.get("/api/consulta/obtener", consulta_1.getConsulta);
router.put("/api/consulta/update/:Cid", consulta_1.updateConsulta);
exports.default = router;
