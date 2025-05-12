import { Router } from "express";
import { actualizarCitaNoRegistrado, crearCitaNoRegistrado, eliminarCitaNoRegistrado, obtenerCitasNoRegistrados } from "../controllers/agendaNoRegistrados";
import validateToken from "./validateToken";


const router = Router();

router.get("/api/agendaNoRegistrado/obtener_citas",validateToken,obtenerCitasNoRegistrados );
router.post("/api/agendaNoRegistrado/crear",validateToken, crearCitaNoRegistrado);
router.patch("/api/agendaNoRegistrado/actualizar/:ANRid",validateToken, actualizarCitaNoRegistrado ); 
router.delete("/api/agendaNoRegistrado/eliminar/:ANRid",validateToken,eliminarCitaNoRegistrado );

export default router;
