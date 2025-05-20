import { Request, Response } from "express";
import { Consulta } from "../models/consulta";
import { Paciente  } from "../models/paciente";
import { User } from "../models/user";
import multer from "multer";
import { QueryTypes } from "sequelize";
import sequelize from "../database/connection";
import { PDFDocument } from "pdf-lib";
import { decryptData, encryptData } from "./encriptado";

function desencriptarConsulta(consulta: any): any {
  if (!consulta) return consulta;
  
  // Lista de campos que NO requieren desencriptación
  const camposNoEncriptados = [
    'Cid', 'Uid', 'numero_documento', 'fecha', 'consentimiento_info',
    'consentimiento_check', 'abierto', 'motivo_cierre', 'fecha_cierre', 
    'cerrado_por', 'fecha_creacion', 'ultima_actualizacion', 'createdAt', 
    'updatedAt', 'correo'
  ];
  
  // Clonar el objeto para no modificar el original
  const consultaDesencriptada = { ...consulta };
  
  // Desencriptar todos los campos excepto los que están en la lista de exclusión
  Object.keys(consultaDesencriptada).forEach(campo => {
    if (!camposNoEncriptados.includes(campo) && consultaDesencriptada[campo]) {
      try {
        consultaDesencriptada[campo] = decryptData(consultaDesencriptada[campo]);
      } catch (error) {
        console.error(`Error al desencriptar campo ${campo} en consulta:`, error);
        // Mantener el valor original en caso de error
      }
    }
  });
  
  return consultaDesencriptada;
}

const storage = multer.memoryStorage(); // Almacena en memoria
const upload = multer({
    storage,
    limits: { 
        fileSize: 15 * 1024 * 1024 // 15MB máximo (el doble de tu archivo actual)
    }
});
export const uploadConsentimiento = upload.single('consentimiento_info');
export const nuevaConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { numero_documento } = req.params;
        const {
            motivo, 
            enfermedad_actual, 
            objetivos_terapia, 
            historia_problema, 
            tipo_diagnostico, 
            
            recomendaciones, 
            fecha,
            contraindicaciones,
            abierto,
            Uid
        } = req.body;
        const consentimientoArchivo = req.file ? req.file.buffer : null;
        if (!Uid) {
            return res.status(400).json({ 
                message: "Se requiere ID de usuario (doctor) para crear una consulta" 
            });
        }

        // Verificar que el usuario existe y es un doctor
        const doctor = await User.findByPk(Uid);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor no encontrado" });
        }
        
        // Verificar que el paciente existe
        const paciente = await Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({
                message: "El paciente no existe",
                numero_documento
            });
        }
        const correoDoctor = doctor.correo;
        // Buscar consultas abiertas del paciente
        const consultasAbiertas = await Consulta.findAll({
            where: { 
                numero_documento,
                abierto: true
            }
        });

        // Cerrar automáticamente todas las consultas abiertas
        if (consultasAbiertas.length > 0) {
            for (const consulta of consultasAbiertas) {
                await consulta.update({
                    abierto: false,
                    motivo_cierre: "Cerrada automáticamente al crear nueva consulta",
                    fecha_cierre: new Date(),
                    cerrado_por: Uid
                });
            }
            
            console.log(`Se cerraron automáticamente ${consultasAbiertas.length} consultas previas del paciente ${numero_documento}`);
        }

        // Crear la nueva consulta
        const nuevaConsulta = await Consulta.create({
            Uid,
            numero_documento,
            motivo: encryptData(motivo),
            enfermedad_actual: encryptData(enfermedad_actual),
            objetivos_terapia: encryptData(objetivos_terapia),
            historia_problema: encryptData(historia_problema),
            tipo_diagnostico: encryptData(tipo_diagnostico),
            contraindicaciones: encryptData(contraindicaciones),
            recomendaciones: encryptData(recomendaciones),
            fecha: fecha || new Date(),
            correo: correoDoctor, 
            consentimiento_info: consentimientoArchivo,
            consentimiento_check: req.file ? true : false,
            abierto: abierto !== undefined ? abierto : true,
            fecha_creacion: new Date()
        });

        // Desencriptar para la respuesta
        const consultaJSON = nuevaConsulta.toJSON();
        const consultaDesencriptada = desencriptarConsulta(consultaJSON);

        return res.status(201).json({
            message: "Consulta creada correctamente",
            consultasAnterioresCerradas: consultasAbiertas.length,
            consulta: {
                ...consultaDesencriptada,
                doctor: {
                    id: doctor.Uid,
                    nombre: doctor.nombre
                },
                paciente: {
                    numero_documento: paciente.numero_documento,
                    nombre: paciente.nombre,
                    apellidos: paciente.apellidos
                }
            }
        });
    } catch (error: unknown) {
        console.error('Error al crear la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al crear consulta',
            error: errorMessage 
        });
    }
};

export const updateConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        const updatedData = req.body;

        if (!Cid) {
            return res.status(400).json({
                message: "ID de la consulta no proporcionado"
            });
        }

        // Asegurarnos que Cid es un número
        const consultaId = parseInt(Cid, 10);
        
        if (isNaN(consultaId)) {
            return res.status(400).json({
                message: "ID de consulta debe ser un número válido"
            });
        }

        // Buscar la consulta existente
        const consulta = await Consulta.findByPk(consultaId);
        
        if (!consulta) {
            return res.status(404).json({ 
                message: "Consulta no encontrada",
                Cid 
            });
        } 

        // Verificar que la consulta está abierta
        if (consulta.abierto === false) {
            return res.status(400).json({
                message: "La consulta ya ha sido cerrada y no se puede actualizar"
            });
        }

        // Preparar datos para actualización con encriptación
        const datosEncriptados: any = {};
        
        // Lista de campos que deben encriptarse
        const camposAEncriptar = ['motivo', 'enfermedad_actual', 'objetivos_terapia', 
            'historia_problema', 'tipo_diagnostico', '', 
            'contraindicaciones', 'recomendaciones'];
        
        // Procesar cada campo en la actualización
        Object.keys(updatedData).forEach(campo => {
            if (camposAEncriptar.includes(campo) && updatedData[campo] !== undefined) {
                datosEncriptados[campo] = encryptData(updatedData[campo]);
            } else {
                datosEncriptados[campo] = updatedData[campo];
            }
        });

        // Registrar la última actualización
        datosEncriptados.ultima_actualizacion = new Date();

        // Actualizar solo los campos proporcionados
        await consulta.update(datosEncriptados);

        // Obtener la consulta actualizada sin relaciones primero
        const consultaActualizada = await Consulta.findByPk(consultaId, {
            attributes: { exclude: ['consentimiento_info'] }
        });

        if (!consultaActualizada) {
            return res.status(404).json({
                message: "Error al obtener la consulta actualizada"
            });
        }

        // Buscar el doctor usando el Uid de la consulta
        const doctor = await User.findByPk(consultaActualizada.Uid, {
            attributes: ['Uid', 'nombre', 'rol', 'correo']
        });

        // Buscar el paciente usando el numero_documento de la consulta
        const paciente = await Paciente.findByPk(consultaActualizada.numero_documento, {
            attributes: ['numero_documento', 'nombre', 'apellidos']
        });

        // Desencriptar la consulta
        const consultaJSON = consultaActualizada.toJSON();
        const consultaDesencriptada = desencriptarConsulta(consultaJSON);

        // Construir manualmente el resultado
        const resultado = {
            ...consultaDesencriptada,
            tiene_consentimiento: consultaActualizada.consentimiento_check || false,
            doctor: doctor ? doctor.toJSON() : null,
            paciente: paciente ? paciente.toJSON() : null
        };

        // Responder con éxito
        return res.status(200).json({
            message: "Consulta actualizada correctamente",
            data: resultado
        });
        
    } catch (error) {
        console.error('Error al actualizar la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al actualizar consulta',
            error: errorMessage 
        });
    }
};
export const getConsultasPorPaciente = async (req: Request, res: Response): Promise<any> => {
    try {
        const { numero_documento } = req.params;
        
        // Verificar que el paciente existe
        const paciente = await Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({
                message: "Paciente no encontrado"
            });
        }

        // Paso 1: Obtener solo las consultas sin incluir el usuario
        const consultas = await Consulta.findAll({
            where: { numero_documento },
            attributes: { exclude: ['consentimiento_info'] }, // Excluir el PDF
            order: [['fecha', 'DESC']]
        });

        // Procesar y desencriptar todas las consultas
        const resultado = [];
        
        for (const consulta of consultas) {
            const doctor = await User.findByPk(consulta.Uid, {
                attributes: ['Uid', 'nombre', 'rol']
            });
            
            // Desencriptar los campos de la consulta
            const consultaJSON = consulta.toJSON();
            const consultaDesencriptada = desencriptarConsulta(consultaJSON);
            
            resultado.push({
                ...consultaDesencriptada,
                doctor: doctor ? doctor.toJSON() : null
            });
        }

        return res.status(200).json({
            message: "Consultas obtenidas correctamente",
            total: consultas.length,
            data: resultado
        });
        
    } catch (error) {
        console.error('Error al obtener consultas del paciente:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener consultas',
            error: errorMessage 
        });
    }
};

export const getConsultasDoctor = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Uid } = req.params;
        
        if (!Uid) {
            return res.status(400).json({
                message: "Se requiere ID del doctor"
            });
        }
        
        // Verificar que el doctor existe
        const doctor = await User.findByPk(Uid);
        if (!doctor) {
            return res.status(404).json({
                message: "Doctor no encontrado"
            });
        }

        const consultas = await Consulta.findAll({
            where: { Uid },
            attributes: { exclude: ['consentimiento_info'] }, // Excluir el PDF
            include: [
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos']
                }
            ],
            order: [['fecha', 'DESC']]
        });

        // Desencriptar datos de todas las consultas
        const consultasDesencriptadas = consultas.map(consulta => {
            const consultaJSON = consulta.toJSON();
            return {
                ...desencriptarConsulta(consultaJSON),
                paciente: consultaJSON.paciente // Mantener la relación con paciente
            };
        });

        return res.status(200).json({
            message: "Consultas obtenidas correctamente",
            total: consultas.length,
            doctor: {
                nombre: doctor.nombre,
                rol: doctor.rol
            },
            data: consultasDesencriptadas
        });
    } catch (error) {
        console.error('Error al obtener consultas del doctor:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener consultas',
            error: errorMessage 
        });
    }
};
export const cerrarConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        const { motivo_cierre, Uid } = req.body;
        
        if (!Cid) {
            return res.status(400).json({
                message: "ID de la consulta no proporcionado"
            });
        }

        const consulta = await Consulta.findByPk(Cid);
        
        if (!consulta) {
            return res.status(404).json({ 
                message: "Consulta no encontrada" 
            });
        }
        
        if (consulta.abierto === false) {
            return res.status(400).json({
                message: "La consulta ya está cerrada"
            });
        }

        await consulta.update({
            abierto: false,
            motivo_cierre: motivo_cierre || "Consulta cerrada",
            fecha_cierre: new Date(),
            cerrado_por: Uid
        });

        // Desencriptar para la respuesta
        const consultaJSON = consulta.toJSON();
        const consultaDesencriptada = desencriptarConsulta(consultaJSON);

        return res.status(200).json({
            message: "Consulta cerrada correctamente",
            data: consultaDesencriptada
        });
    } catch (error) {
        console.error('Error al cerrar la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al cerrar la consulta',
            error: errorMessage 
        });
    }
};
export const getConsentimientoPDF = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        if (!Cid) {
            return res.status(400).json({
                message: "Se requiere ID de consulta"
            });
        }

        // Consulta SQL directa - mucho más rápida para BLOBs grandes
        const [resultado] = await sequelize.query(
            'SELECT "consentimiento_info", "consentimiento_check" FROM "Consulta" WHERE "Cid" = :Cid LIMIT 1',
            {
                replacements: { Cid },
                type: QueryTypes.SELECT,
                raw: true
            }
        );

        if (!resultado) {
            return res.status(404).json({
                message: 'Consulta no encontrada',
                Cid
            });
        }

        // @ts-ignore - El tipo de resultado puede variar
        if (!resultado.consentimiento_info || !resultado.consentimiento_check) {
            return res.status(404).json({
                message: 'Esta consulta no tiene un documento de consentimiento'
            });
        }

        try {
            // @ts-ignore - Obtener el PDF original
            const originalBuffer = Buffer.from(resultado.consentimiento_info);
            const originalSizeBytes = originalBuffer.length;
            const pdfDoc = await PDFDocument.load(originalBuffer);
            // Comprimir el PDF con opciones optimizadas
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: 500
            });
            
            const compressedBuffer = Buffer.from(compressedPdfBytes);
            
            // Calcular tamaño comprimido y porcentaje de reducción
            const compressedSizeBytes = compressedBuffer.length;
            const reductionPercent = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes * 100).toFixed(2);
            
            if (compressedSizeBytes >= originalSizeBytes) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=consentimiento_${Cid}.pdf`);
                res.setHeader('Content-Length', originalSizeBytes);
                return res.send(originalBuffer);
            }
            
            // Enviar el PDF comprimido
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=consentimiento_${Cid}.pdf`);
            res.setHeader('Content-Length', compressedSizeBytes);
            res.setHeader('X-Compression-Rate', `${reductionPercent}%`);
            
            return res.send(compressedBuffer);
            
        } catch (compressError) {
            console.error('Error al comprimir PDF:', compressError);
            // @ts-ignore
            const fallbackBuffer = Buffer.from(resultado.consentimiento_info);
            const fallbackSize = fallbackBuffer.length;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=consentimiento_${Cid}.pdf`);
            res.setHeader('Content-Length', fallbackSize);
            
            return res.send(fallbackBuffer);
        }
        
    } catch (error) {
        console.error('Error al obtener el PDF de consentimiento:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener el documento',
            error: errorMessage 
        });
    }
};
export const getConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid, numero_documento } = req.params;
        
        // Asegurarnos que Cid es un número
        const consultaId = parseInt(Cid, 10);
        
        if (isNaN(consultaId)) {
            return res.status(400).json({
                message: "ID de consulta debe ser un número válido"
            });
        }

        // Primero, obtener la consulta básica sin relaciones problemáticas
        const consulta = await Consulta.findByPk(consultaId, {
            attributes: { exclude: ['consentimiento_info'] } // Excluir el PDF
        });

        if (!consulta) {
            return res.status(404).json({
                message: "Consulta no encontrada",
                Cid
            });
        }

        // VALIDACIÓN DE SEGURIDAD - Verificar que la consulta corresponde al paciente correcto
        if (consulta.numero_documento !== numero_documento) {
            return res.status(403).json({
                message: "No tienes permiso para acceder a esta consulta",
                error: "El número de documento no coincide con la consulta solicitada"
            });
        }

        // Buscar el doctor usando el Uid de la consulta
        const doctor = await User.findByPk(consulta.Uid, {
            attributes: ['Uid', 'nombre', 'rol', 'correo']
        });

        // Buscar el paciente usando el numero_documento de la consulta
        const paciente = await Paciente.findByPk(consulta.numero_documento, {
            attributes: ['numero_documento', 'nombre', 'apellidos']
        });

        // Desencriptar la consulta
        const consultaJSON = consulta.toJSON();
        const consultaDesencriptada = desencriptarConsulta(consultaJSON);

        // Construir manualmente el resultado
        const resultado = {
            ...consultaDesencriptada,
            tiene_consentimiento: consulta.consentimiento_check || false,
            doctor: doctor ? doctor.toJSON() : null,
            paciente: paciente ? paciente.toJSON() : null
        };

        return res.status(200).json({
            message: "Consulta obtenida correctamente",
            data: resultado
        });
    } catch (error) {
        console.error('Error al obtener consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener consulta',
            error: errorMessage 
        });
    }
};
export const getConsultaid = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        
        // Asegurarnos que Cid es un número
        const consultaId = parseInt(Cid, 10);
        
        if (isNaN(consultaId)) {
            return res.status(400).json({
                message: "ID de consulta debe ser un número válido"
            });
        }

        // Primero, obtener la consulta básica sin relaciones problemáticas
        const consulta = await Consulta.findByPk(consultaId, {
            attributes: { exclude: ['consentimiento_info'] } // Excluir el PDF
        });

        if (!consulta) {
            return res.status(404).json({
                message: "Consulta no encontrada",
                Cid
            });
        }

        // Buscar el doctor usando el Uid de la consulta
        const doctor = await User.findByPk(consulta.Uid, {
            attributes: ['Uid', 'nombre', 'rol', 'correo']
        });

        // Buscar el paciente usando el numero_documento de la consulta
        const paciente = await Paciente.findByPk(consulta.numero_documento, {
            attributes: ['numero_documento', 'nombre', 'apellidos']
        });

        // Desencriptar la consulta
        const consultaJSON = consulta.toJSON();
        const consultaDesencriptada = desencriptarConsulta(consultaJSON);

        // Construir manualmente el resultado
        const resultado = {
            ...consultaDesencriptada,
            tiene_consentimiento: consulta.consentimiento_check || false,
            doctor: doctor ? doctor.toJSON() : null,
            paciente: paciente ? paciente.toJSON() : null
        };

        return res.status(200).json({
            message: "Consulta obtenida correctamente",
            data: resultado
        });
    } catch (error) {
        console.error('Error al obtener consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener consulta',
            error: errorMessage 
        });
    }
};
export const subirConsentimientoInformado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        
        // Verificar que la consulta existe
        const consulta = await Consulta.findByPk(Cid);
        if (!consulta) {
            return res.status(404).json({
                message: "Consulta no encontrada",
                Cid
            });
        }

        // Verificar que se ha subido un archivo
        if (!req.file) {
            return res.status(400).json({
                message: "No se ha proporcionado el archivo de consentimiento informado"
            });
        }

        // Actualizar la consulta con el consentimiento
        await consulta.update({
            consentimiento_info: req.file.buffer,
            consentimiento_check: true
        });

        return res.status(200).json({
            message: "Consentimiento informado subido correctamente",
            consulta: {
                Cid: consulta.Cid,
                tiene_consentimiento: true
            }
        });
    } catch (error) {
        console.error('Error al subir consentimiento informado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al subir consentimiento informado',
            error: errorMessage 
        });
    }
};
export const verificarConsentimientoInformado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        
        if (!Cid) {
            return res.status(400).json({
                message: "Se requiere ID de consulta"
            });
        }

        // Consulta optimizada - solo traemos los campos necesarios
        const consulta = await Consulta.findByPk(Cid, {
            attributes: ['Cid', 'consentimiento_check', 'numero_documento']
        });

        if (!consulta) {
            return res.status(404).json({
                message: "Consulta no encontrada",
                Cid
            });
        }

        // Verificar si existe un consentimiento
        const tieneConsentimiento = consulta.consentimiento_check || false;
        
        return res.status(200).json({
            message: tieneConsentimiento 
                ? "La consulta tiene un consentimiento informado asociado" 
                : "La consulta no tiene un consentimiento informado asociado",
            data: {
                Cid: consulta.Cid,
                tieneConsentimiento,
                numero_documento: consulta.numero_documento
            }
        });
    } catch (error) {
        console.error('Error al verificar consentimiento informado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al verificar consentimiento',
            error: errorMessage 
        });
    }
};