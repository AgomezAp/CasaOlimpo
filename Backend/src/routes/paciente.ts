import { Router } from "express";
import {
  actualizarDatosPaciente,
  crearPaciente,
  obtenerPacienteId,
  obtenerPacientes,
} from "../controllers/paciente";

const router = Router();

router.post("/api/paciente/crear", crearPaciente);
router.get("/api/paciente/traer_todos", obtenerPacientes);
router.get("/api/paciente/consultar/:numero_documento", obtenerPacienteId);
router.patch("/api/paciente/actualizar/:numero_documento", actualizarDatosPaciente);
export default router;
