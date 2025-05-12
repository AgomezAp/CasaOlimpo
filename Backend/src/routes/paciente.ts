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
  transferirPaciente,
  uploadPacienteFoto,
} from "../controllers/paciente";
import validateToken from "./validateToken";

const router = Router();

router.post("/api/paciente/crear",validateToken, crearPaciente);
router.get("/api/paciente/traer_todos",validateToken, obtenerPacientes);
router.get("/api/paciente/consultar/:numero_documento",validateToken, obtenerPacienteId);
router.patch("/api/paciente/actualizar/:numero_documento",validateToken, actualizarDatosPaciente);

router.post("/api/paciente/:numero_documento/foto",validateToken, [uploadPacienteFoto.single("foto") ], actualizarFotoPaciente);
router.delete('/api/paciente/:numero_documento/foto',validateToken,  eliminarFotoPaciente);
router.get('/api/paciente/:numero_documento/foto',validateToken,  obtenerFotoPaciente);
router.get('/api/doctor/:Uid/pacientes',validateToken, obtenerPacientesPorDoctor);


router.post('/api/paciente/:numero_documento/transferir', transferirPaciente);
export default router;
