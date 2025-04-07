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
export const getConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params; // Usar params en lugar de body
        
        if (!Cid) {
            return res.status(400).json({
                message: "Se requiere ID de consulta"
            });
        }

        const consulta = await Consulta.findByPk(Cid, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['Uid', 'nombre', 'rol'] 
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos'] 
                }
            ]
        });

        if (!consulta) {
            return res.status(404).json({
                message: 'Consulta no encontrada',
                Cid
            });
        }

        return res.status(200).json({
            message: "Consulta obtenida correctamente",
            data: consulta
        });
    } catch (error) {
        console.error('Error al obtener la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener consulta',
            error: errorMessage 
        });
    }
}
export const updateConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        const updatedData = req.body;

        if (!Cid) {
            return res.status(400).json({
                message: "ID de la consulta no proporcionado"
            });
        }

        // Buscar la consulta existente
        const consulta = await Consulta.findByPk(Cid);
        
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

        // Obtener la consulta actualizada con sus relaciones
        const consultaActualizada = await Consulta.findByPk(Cid, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['Uid', 'nombre', 'rol']
                },
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos']
                }
            ]
        });

        // Responder con éxito
        return res.status(200).json({
            message: "Consulta actualizada correctamente",
            data: consultaActualizada
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
            order: [['fecha', 'DESC']]
        });

        // Paso 2: Para cada consulta, buscar manualmente la información del doctor
        const resultado = [];
        
        for (const consulta of consultas) {
            // Obtener los datos del doctor usando el Uid de la consulta
            const doctor = await User.findByPk(consulta.Uid, {
                attributes: ['Uid', 'nombre', 'rol']
            });
            
            // Combinar la consulta con los datos del doctor
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
            include: [
                {
                    model: Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos']
                }
            ],
            order: [['fecha', 'DESC']]
        });

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