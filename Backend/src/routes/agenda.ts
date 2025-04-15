import { Router } from "express";
import { actualizarCita, crearCita, eliminarCita, getHorasOcupadas, obtenerCitas, obtenerCitasPorDoctor, obtenerCitasPorPaciente } from "../controllers/agenda";

const router = Router();

router.post("/api/agenda/crear", crearCita);
router.patch("/api/agenda/actualizar/:Aid", actualizarCita); 
router.delete("/api/agenda/eliminar/:Aid", eliminarCita);
router.get("/api/agenda/obtener_citas", obtenerCitas);
router.get("/api/agenda/obtener_citas/:numero_documento", obtenerCitasPorDoctor);
router.get('/api/agenda/:numero_documento/citas', obtenerCitasPorPaciente);
router.get('/api/agenda/horas-ocupadas/:fecha', getHorasOcupadas);
export default router;
