import { Router } from "express";
import {
  actualizarDatosPaciente,
  actualizarFotoPaciente,
  crearPaciente,
  eliminarFotoPaciente,
  obtenerFotoPaciente,
  obtenerPacienteId,
  obtenerPacientes,
  obtenerPacientesPorDoctor,
  uploadPacienteFoto,
} from "../controllers/paciente";

const router = Router();

router.post("/api/paciente/crear", crearPaciente);
router.get("/api/paciente/traer_todos", obtenerPacientes);
router.get("/api/paciente/consultar/:numero_documento", obtenerPacienteId);
router.patch("/api/paciente/actualizar/:numero_documento", actualizarDatosPaciente);

router.post("/api/paciente/:numero_documento/foto", [uploadPacienteFoto.single("foto") ], actualizarFotoPaciente);
router.delete('/api/paciente/:numero_documento/foto',  eliminarFotoPaciente);
router.get('/api/paciente/:numero_documento/foto',  obtenerFotoPaciente);
router.get('/api/doctor/:Uid/pacientes', obtenerPacientesPorDoctor);
export default router;
