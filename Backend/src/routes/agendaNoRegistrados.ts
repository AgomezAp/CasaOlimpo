import { Router } from "express";
import { actualizarCitaNoRegistrado, crearCitaNoRegistrado, eliminarCitaNoRegistrado, obtenerCitasNoRegistrados } from "../controllers/agendaNoRegistrados";


const router = Router();

router.get("/api/agendaNoRegistrado/obtener_citas",obtenerCitasNoRegistrados );
router.post("/api/agendaNoRegistrado/crear", crearCitaNoRegistrado);
router.patch("/api/agendaNoRegistrado/actualizar/:ANRid", actualizarCitaNoRegistrado ); 
router.delete("/api/agendaNoRegistrado/eliminar/:ANRid",eliminarCitaNoRegistrado );

export default router;
