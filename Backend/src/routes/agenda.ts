import { Router } from "express";
import { actualizarCita, crearCita, eliminarCita, getHorasOcupadas, obtenerCitas, obtenerCitasPorDoctor, obtenerCitasPorPaciente } from "../controllers/agenda";
import validateToken from "./validateToken";

const router = Router();

router.post("/api/agenda/crear",validateToken, crearCita);
router.patch("/api/agenda/actualizar/:Aid",validateToken, actualizarCita); 
router.delete("/api/agenda/eliminar/:Aid", validateToken,eliminarCita);
router.get("/api/agenda/obtener_citas", validateToken,obtenerCitas);
router.get("/api/agenda/obtener_citas/:numero_documento",validateToken, obtenerCitasPorDoctor);
router.get('/api/agenda/:numero_documento/citas',validateToken, obtenerCitasPorPaciente);
router.get('/api/agenda/horas-ocupadas/:fecha',validateToken, getHorasOcupadas);
export default router;
