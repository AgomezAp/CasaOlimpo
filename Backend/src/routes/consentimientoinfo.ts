import { Router } from "express";
import { 
  guardarConsentimiento, 
  obtenerConsentimientosPaciente, 
  descargarConsentimiento, 
  eliminarConsentimiento,
  uploadMiddleware 
} from "../controllers/consentimientoinfo";
import validateToken from "./validateToken";

const router = Router();

// Guardar un nuevo consentimiento
router.post("/api/consentimiento/:numero_documento/crear", [validateToken, uploadMiddleware], guardarConsentimiento);

// Obtener la lista de consentimientos de un paciente
router.get("/api/consentimiento/:numero_documento", [validateToken], obtenerConsentimientosPaciente);

// Descargar un consentimiento específico
router.get("/api/consentimiento/descargar/:Cid", [validateToken], descargarConsentimiento);

// Eliminar un consentimiento
router.delete("/api/consentimiento/:Cid", [validateToken], eliminarConsentimiento);

export default router;