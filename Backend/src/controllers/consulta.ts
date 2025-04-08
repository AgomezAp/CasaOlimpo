import { Request, Response } from "express";
import { Consulta } from "../models/consulta";
import { Paciente  } from "../models/paciente";
import { User } from "../models/user";
import multer from "multer";
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
            desarrollo, 
            plan_terapeutico,
            tipo_diagnostico, 
            analisis_diagnostico, 
            plan_tratamiento, 
            recomendaciones, 
            fecha,
            // ELIMINAR correo de aquí, lo obtendremos del usuario
            consentimiento_check, 
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
        // NUEVO: Buscar consultas abiertas del paciente
        const consultasAbiertas = await Consulta.findAll({
            where: { 
                numero_documento,
                abierto: true
            }
        });

        // NUEVO: Cerrar automáticamente todas las consultas abiertas
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
            motivo,
            enfermedad_actual,
            objetivos_terapia,
            historia_problema,
            desarrollo,
            plan_terapeutico,
            tipo_diagnostico,
            analisis_diagnostico,
            plan_tratamiento,
            recomendaciones,
            fecha: fecha || new Date(),
            correo: correoDoctor, // USAR EL CORREO OBTENIDO DEL DOCTOR
            consentimiento_info: consentimientoArchivo,
            consentimiento_check: req.file ? true : false,
            abierto: abierto !== undefined ? abierto : true,
            fecha_creacion: new Date()
        });

        return res.status(201).json({
            message: "Consulta creada correctamente",
            consultasAnterioresCerradas: consultasAbiertas.length,
            consulta: {
                ...nuevaConsulta.toJSON(),
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

        // Registrar la última actualización
        updatedData.ultima_actualizacion = new Date();

        // Actualizar solo los campos proporcionados
        await consulta.update(updatedData);

        // CAMBIO AQUÍ: Obtener la consulta actualizada sin relaciones primero
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

        // Construir manualmente el resultado
        const resultado = {
            ...consultaActualizada.toJSON(),
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
}
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

        // Resto del código sin cambios...
        const resultado = [];
        
        for (const consulta of consultas) {
            const doctor = await User.findByPk(consulta.Uid, {
                attributes: ['Uid', 'nombre', 'rol']
            });
            
            resultado.push({
                ...consulta.toJSON(),
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

        // Resto del código sin cambios...
        return res.status(200).json({
            message: "Consultas obtenidas correctamente",
            total: consultas.length,
            doctor: {
                nombre: doctor.nombre,
                rol: doctor.rol
            },
            data: consultas
        });
    } catch (error) {
        console.error('Error al obtener consultas del doctor:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener consultas',
            error: errorMessage 
        });
    }
}
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

        return res.status(200).json({
            message: "Consulta cerrada correctamente",
            data: consulta
        });
    } catch (error) {
        console.error('Error al cerrar la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al cerrar la consulta',
            error: errorMessage 
        });
    }
}
export const getConsentimientoPDF = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        
        if (!Cid) {
            return res.status(400).json({
                message: "Se requiere ID de consulta"
            });
        }

        // Buscar la consulta pero solo obtener el campo consentimiento_info
        const consulta = await Consulta.findByPk(Cid, {
            attributes: ['consentimiento_info', 'consentimiento_check']
        });

        if (!consulta) {
            return res.status(404).json({
                message: 'Consulta no encontrada',
                Cid
            });
        }

        // Verificar si existe el PDF
        if (!consulta.consentimiento_info || !consulta.consentimiento_check) {
            return res.status(404).json({
                message: 'Esta consulta no tiene un documento de consentimiento'
            });
        }

        // Enviar el PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=consentimiento_${Cid}.pdf`);
        return res.send(consulta.consentimiento_info);

    } catch (error) {
        console.error('Error al obtener el PDF de consentimiento:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener el documento',
            error: errorMessage 
        });
    }
}
export const getConsulta = async (req: Request, res: Response): Promise<any> => {
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

        // Construir manualmente el resultado
        const resultado = {
            ...consulta.toJSON(),
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