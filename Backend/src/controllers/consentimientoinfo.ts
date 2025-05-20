import { Request, Response } from "express";
import { ConsentimientoInfo } from "../models/consentimientoinfo";
import { Paciente } from "../models/paciente";
import multer from "multer";

// Configuración de multer para almacenar el PDF en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

// Middleware para la subida del documento
export const uploadMiddleware = upload.single('consentimiento_info');

/**
 * Guarda un nuevo documento de consentimiento para un paciente
 */
export const guardarConsentimiento = async (req: Request, res: Response): Promise<any> => {
  try {
    const { numero_documento } = req.params;
    console.log("Intentando guardar consentimiento para paciente:", numero_documento);
    
    // Verificar archivo
    if (!req.file) {
      return res.status(400).json({ 
        message: "Se requiere un archivo PDF" 
      });
    }
    
    // Buscar primero con findOne para depuración
    const paciente = await Paciente.findOne({
      where: { numero_documento: String(numero_documento) }
    });
    
    console.log("Resultado de búsqueda:", paciente ? "Paciente encontrado" : "Paciente NO encontrado");
    
    if (!paciente) {
      // Búsqueda adicional para depuración
      const totalPacientes = await Paciente.count();
      console.log(`Total de pacientes en la base de datos: ${totalPacientes}`);
      
      return res.status(404).json({ 
        message: `Paciente no encontrado con número: ${numero_documento}` 
      });
    }
    
    // Resto del código para guardar el consentimiento
    const nuevoConsentimiento = await ConsentimientoInfo.create({
      numero_documento,
      documento: req.file.buffer,
      fecha_creacion: new Date()
    });
    
    return res.status(201).json({
      message: "Consentimiento guardado correctamente",
      data: {
        Cid: nuevoConsentimiento.Cid,
        numero_documento: nuevoConsentimiento.numero_documento,
        fecha_creacion: nuevoConsentimiento.fecha_creacion
      }
    });
    
  } catch (error: any) {
    console.error("Error completo al guardar consentimiento:", error);
    return res.status(500).json({
      message: "Error al guardar el consentimiento",
      error: error.message
    });
  }
};

/**
 * Obtiene todos los consentimientos de un paciente (sin el contenido del documento)
 */
export const obtenerConsentimientosPaciente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { numero_documento } = req.params;
    
    const consentimientos = await ConsentimientoInfo.findAll({
      where: { numero_documento },
      attributes: ['Cid', 'numero_documento', 'fecha_creacion'], // No incluir el documento (blob)
      order: [['fecha_creacion', 'DESC']]
    });
    
    return res.status(200).json({
      message: "Consentimientos obtenidos correctamente",
      data: consentimientos
    });
    
  } catch (error: any) {
    console.error("Error obteniendo consentimientos:", error);
    return res.status(500).json({
      message: "Error al obtener los consentimientos",
      error: error.message
    });
  }
};

/**
 * Descarga un documento de consentimiento por su ID
 */
export const descargarConsentimiento = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Cid } = req.params;
    
    const consentimiento = await ConsentimientoInfo.findByPk(Cid);
    if (!consentimiento) {
      return res.status(404).json({
        message: "Consentimiento no encontrado"
      });
    }
    
    // Configurar headers para descargar el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=consentimiento_${Cid}.pdf`);
    
    // Enviar el documento
    return res.send(consentimiento.documento);
    
  } catch (error: any) {
    console.error("Error descargando consentimiento:", error);
    return res.status(500).json({
      message: "Error al descargar el consentimiento",
      error: error.message
    });
  }
};

/**
 * Elimina un consentimiento por su ID
 */
export const eliminarConsentimiento = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Cid } = req.params;
    
    const consentimiento = await ConsentimientoInfo.findByPk(Cid);
    if (!consentimiento) {
      return res.status(404).json({
        message: "Consentimiento no encontrado"
      });
    }
    
    await consentimiento.destroy();
    
    return res.status(200).json({
      message: "Consentimiento eliminado correctamente"
    });
    
  } catch (error: any) {
    console.error("Error eliminando consentimiento:", error);
    return res.status(500).json({
      message: "Error al eliminar el consentimiento",
      error: error.message
    });
  }
};