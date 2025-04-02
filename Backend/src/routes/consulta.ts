import { Router } from 'express';
import {updateConsulta, nuevaConsulta, getConsulta} from '../controllers/consulta'
const router = Router();

router.post("/api/consulta/crear", nuevaConsulta);
router.get("/api/consulta/obtener", getConsulta);
router.put("/api/consulta/update",updateConsulta)

export default router;