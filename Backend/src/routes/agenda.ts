import { Router } from "express";
import { actualizarCita, crearCita, eliminarCita, obtenerCitas } from "../controllers/agenda";

const router = Router();

router.post("/api/agenda/crear", crearCita);
router.patch("/api/agenda/actualizar/:id", actualizarCita); // Cambia esto según la lógica de actualización que necesites
router.delete("/api/agenda/eliminar/:id", eliminarCita)
router.get("/api/agenda/obtener_citas", obtenerCitas) // Cambia esto según la lógica de consulta que necesites
router.get("/api/agenda/obtener_citas/:numero_documento", obtenerCitas) // Cambia esto según la lógica de consulta que necesites


export default router;
