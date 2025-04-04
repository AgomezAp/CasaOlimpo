import { Paciente } from "../models/paciente"
import { Request, Response } from "express";
import dotenv from 'dotenv';
import dayjs from "dayjs";
import { decryptData, encryptData } from "./encriptado";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { NextFunction } from 'express';
import { User } from "../models/user";

dotenv.config();

const pacientesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads/pacientes/fotos');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      // Usar número de documento como parte del nombre para fácil identificación
      const documento = req.params.numero_documento || "temp";
      const uniqueFilename = `paciente_${documento}_${Date.now()}${ext}`;
      cb(null, uniqueFilename);
    }
  });
  
  // Filtro para solo permitir imágenes
  const imageFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Solo se permiten imágenes JPEG, JPG y PNG.'), false);
    }
  };
  
  export const uploadPacienteFoto = multer({ 
    storage: pacientesStorage, 
    fileFilter: imageFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // Aumentar a 15MB para fotos dermatológicas originales
  });

  /**
   * Subir o actualizar foto de perfil del paciente
   */
  export const actualizarFotoPaciente = async (req: Request, res: Response) : Promise<any> =>  {
    try {
      const { numero_documento } = req.params;
      
      // Verificar que el paciente existe
      const paciente = await Paciente.findByPk(numero_documento);
      if (!paciente) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Paciente no encontrado' });
      }
      
      // Verificar que se ha subido un archivo
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }
      
      // Si ya tenía una foto, eliminarla
      if (paciente.foto_path) {
        const rutaAnterior = path.join(__dirname, `../../${paciente.foto_path.replace(/^\//, '')}`);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }
      
      // Guardar la ruta de la nueva imagen
      const rutaRelativa = `/uploads/pacientes/fotos/${req.file.filename}`;
      
      await paciente.update({
        foto_path: rutaRelativa
      });
      
      return res.status(200).json({
        message: 'Foto del paciente actualizada correctamente',
        data: {
          foto_path: rutaRelativa
        }
      });
    } catch (error: any) {
      console.error('Error actualizando foto del paciente:', error);
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) { /* No hacer nada */ }
      }
      return res.status(500).json({
        message: 'Error actualizando la foto del paciente',
        error: error.message
      });
    }
  };
  
  /**
   * Eliminar foto del paciente
   */
  export const eliminarFotoPaciente = async (req: Request, res: Response) : Promise<any> => {
    try {
      const { numero_documento } = req.params;
      
      // Verificar que el paciente existe
      const paciente = await Paciente.findByPk(numero_documento);
      if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
      }
      
      // Verificar que tiene una foto
      if (!paciente.foto_path) {
        return res.status(400).json({ message: 'El paciente no tiene foto registrada' });
      }
      
      // Eliminar archivo físico
      const rutaImagen = path.join(__dirname, `../../${paciente.foto_path.replace(/^\//, '')}`);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
      
      // Actualizar paciente
      await paciente.update({
        foto_path: null
      });
      
      return res.status(200).json({
        message: 'Foto del paciente eliminada correctamente'
      });
    } catch (error: any) {
      console.error('Error eliminando foto del paciente:', error);
      return res.status(500).json({
        message: 'Error eliminando la foto del paciente',
        error: error.message
      });
    }
  };
  
  /**
   * Obtener la foto del paciente
   * Nota: Esta función es opcional ya que puedes acceder directamente
   * a la imagen a través de la URL pública
   */
  export const obtenerFotoPaciente = async (req: Request, res: Response): Promise<any> =>  {
    try {
      const { numero_documento } = req.params;
      
      const paciente = await Paciente.findByPk(numero_documento, {
        attributes: ['numero_documento', 'nombre', 'apellidos', 'foto_path']
      });
      
      if (!paciente) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
      }
      
      if (!paciente.foto_path) {
        return res.status(404).json({ message: 'El paciente no tiene foto registrada' });
      }
      
      return res.status(200).json({
        message: 'Foto obtenida correctamente',
        data: {
          foto_path: paciente.foto_path
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo foto del paciente:', error);
      return res.status(500).json({
        message: 'Error obteniendo la foto del paciente',
        error: error.message
      });
    }
  };






  export const crearPaciente = async (req: Request, res: Response): Promise<any> => {
    const {nombre, apellidos, fecha_nacimiento,sexo, ciudad_nacimiento,edad,tipo_documento,numero_documento,ciudad_expedicion,ciudad_domicilio,barrio,direccion_domicilio,telefono,email,celular,ocupacion,estado_civil,eps,tipo_afiliacion,grupo_sanguineo,rh,alergias,antecedentes,antecedentes_familiares}= req.body
    const { Uid } = req.body;
    
    try{
        // Verificar que el doctor existe y tiene el rol correcto
        const doctor = await User.findByPk(Uid);
        if (!doctor || doctor.rol !== 'Doctor') {
          return res.status(400).json({ message: 'Usuario no autorizado para crear pacientes' });
        }
        
        // Verificar si el paciente ya existe
        const paciente = await Paciente.findOne({where:{numero_documento}})
        if(paciente){
            return res.status(400).json({
                message: "El paciente ya existe"
            })
        }
        
        // Validar formato de fecha
        const fechaFormateada = dayjs(fecha_nacimiento, "YYYY-MM-DD", true);
        if (!fechaFormateada.isValid()) {
            return res.status(400).json({
                message: "El formato de la fecha de nacimiento es inválido. Debe ser YYYY-MM-DD.",
            });
        }
        
        // Encriptar datos sensibles
        const direccionCifrada = encryptData(direccion_domicilio);
        const alergiasCifradas = encryptData(alergias);
        const antecedentesCifrados = encryptData(antecedentes);
        const antecedentesFamiliaresCifrados = encryptData(antecedentes_familiares);

        // Crear el paciente incluyendo el Uid del doctor
        const nuevoPaciente = await Paciente.create({
            Uid, // Aquí estaba faltando incluir el Uid
            nombre,
            apellidos,
            fecha_nacimiento: fechaFormateada.toDate(),
            sexo,
            ciudad_nacimiento,
            edad,
            tipo_documento,
            numero_documento,
            ciudad_expedicion,
            ciudad_domicilio,
            barrio,
            direccion_domicilio: direccionCifrada,
            telefono,
            email,
            celular,
            ocupacion,
            estado_civil,
            eps,
            tipo_afiliacion,
            grupo_sanguineo,
            rh,
            alergias: alergiasCifradas, 
            antecedentes: antecedentesCifrados, 
            antecedentes_familiares: antecedentesFamiliaresCifrados, 
        });
        
        return res.status(201).json({
            message: "Paciente registrado correctamente",
            data: {
                ...nuevoPaciente.toJSON(),
                doctor: {
                    Uid: doctor.Uid,
                    nombre: doctor.nombre
                }
            },
        });
    } catch (err: any) {
        console.error("Error registrando al paciente:", err);
        res.status(500).json({
            message: "Error registrando al paciente",
            error: err.message,
        });
    }
}

export const obtenerPacientes = async (req: Request, res: Response): Promise<any> => { 
    try {
        const pacientes = await Paciente.findAll();
        
        // Descifrar los datos sensibles de cada paciente
        const pacientesDescifrados = pacientes.map(paciente => {
            const pacienteJSON = paciente.toJSON();
            
            // Usar try-catch para cada campo individualmente
            try {
                pacienteJSON.direccion_domicilio = decryptData(pacienteJSON.direccion_domicilio);
            } catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar dirección: ${e.message}`);
                } else {
                    console.error("Error al desencriptar dirección: Error desconocido");
                }
                pacienteJSON.direccion_domicilio = '';
            }
            
            try {
                pacienteJSON.alergias = decryptData(pacienteJSON.alergias);
            } catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar alergias: ${e.message}`);
                } else {
                    console.error("Error al desencriptar alergias: Error desconocido");
                }
                pacienteJSON.alergias = '';
            }
            
            try {
                pacienteJSON.antecedentes = decryptData(pacienteJSON.antecedentes);
            } catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar antecedentes: ${e.message}`);
                } else {
                    console.error("Error al desencriptar antecedentes: Error desconocido");
                }
                pacienteJSON.antecedentes = '';
            }
            
            try {
                pacienteJSON.antecedentes_familiares = decryptData(pacienteJSON.antecedentes_familiares);
            } catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar antecedentes familiares: ${e.message}`);
                } else {
                    console.error("Error al desencriptar antecedentes familiares: Error desconocido");
                }
                pacienteJSON.antecedentes_familiares = '';
            }
            
            return pacienteJSON;
        });

        return res.status(200).json({
            message: "Lista de pacientes",
            data: pacientesDescifrados,
        });
    } catch (err: any) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Error obteniendo la lista de pacientes",
            error: err.message,
        });
    }
};
export const obtenerPacienteId = async (req: Request, res: Response): Promise<any> => {
    const { numero_documento } = req.params;
    try {
        const paciente = await Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({
                message: "Paciente no encontrado",
            });
        }

        // Aquí está el problema: necesitas convertir primero a objeto plano antes de modificar
        const pacienteJSON = paciente.toJSON();
        
        // Desencriptar los datos sensibles
        pacienteJSON.direccion_domicilio = decryptData(pacienteJSON.direccion_domicilio);
        pacienteJSON.alergias = decryptData(pacienteJSON.alergias);
        pacienteJSON.antecedentes = decryptData(pacienteJSON.antecedentes);
        pacienteJSON.antecedentes_familiares = decryptData(pacienteJSON.antecedentes_familiares);

        return res.status(200).json({
            message: "Paciente encontrado",
            data: pacienteJSON,
        });
    } catch (err: any) {
        console.error("Error al obtener paciente:", err);
        res.status(500).json({
            message: "Error obteniendo el paciente",
            error: err.message,
        });
    }
};
export const actualizarDatosPaciente = async (req: Request, res: Response): Promise<any> => {
    const { numero_documento } = req.params;
    const datosActualizados = req.body;
    
    try {
        const paciente = await Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        // Preparar objeto de actualización solo con los campos proporcionados
        const actualizaciones: any = {};
        
        // Procesar solo los campos que vienen en el request
        if (datosActualizados.direccion_domicilio)
            actualizaciones.direccion_domicilio = encryptData(datosActualizados.direccion_domicilio);
        
        // Campos normales (sin encriptar)
        ['edad', 'tipo_documento', 'ciudad_expedicion', 'ciudad_domicilio', 
         'barrio', 'telefono', 'email', 'celular', 'ocupacion', 
         'estado_civil', 'eps', 'tipo_afiliacion', 'consentimiento_info'
        ].forEach(campo => {
            if (campo in datosActualizados) {
                actualizaciones[campo] = datosActualizados[campo];
            }
        });
        
        // Campos que requieren encriptación
        ['alergias', 'antecedentes', 'antecedentes_familiares'].forEach(campo => {
            if (campo in datosActualizados) {
                actualizaciones[campo] = encryptData(datosActualizados[campo]);
            }
        });

        // Solo actualiza los campos que se proporcionaron
        await paciente.update(actualizaciones);

        return res.status(200).json({
            message: "Paciente actualizado correctamente",
        });
    } catch (err: any) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Error actualizando el paciente",
            error: err.message
        });
    }
}
export const asignarPacienteADoctor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { numero_documento, Uid } = req.body;
    
    // Verificar que el paciente existe
    const paciente = await Paciente.findByPk(numero_documento);
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Verificar que el doctor existe
    const doctor = await User.findByPk(Uid);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }
    
    // Verificar que el usuario es un doctor
    if (doctor.rol !== 'DOCTOR') {
      return res.status(400).json({ message: 'El usuario no es un doctor' });
    }
    
    // Asignar el doctor al paciente
    await paciente.update({ Uid });
    
    return res.status(200).json({
      message: 'Paciente asignado correctamente al doctor',
      data: {
        paciente: paciente.nombre + ' ' + paciente.apellidos,
        doctor: doctor.nombre,
        Uid: doctor.Uid
      }
    });
  } catch (error: any) {
    console.error('Error asignando paciente a doctor:', error);
    return res.status(500).json({
      message: 'Error asignando paciente a doctor',
      error: error.message
    });
  }
};
export const obtenerPacientesPorDoctor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Uid } = req.params;
    
    // Verificar que el doctor existe
    const doctor = await User.findByPk(Uid);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor no encontrado' });
    }
    
    // Verificar que el usuario es un doctor
    if (doctor.rol !== 'Doctor') {
      return res.status(400).json({ message: 'El usuario no es un doctor' });
    }
    
    // Obtener todos los pacientes asignados al doctor
    const pacientes = await Paciente.findAll({
      where: { Uid },
      order: [['nombre', 'ASC'], ['apellidos', 'ASC']]
    });
    
    return res.status(200).json({
      message: 'Pacientes obtenidos correctamente',
      data: {
        doctor: doctor.nombre,
        total_pacientes: pacientes.length,
        pacientes
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo pacientes por doctor:', error);
    return res.status(500).json({
      message: 'Error obteniendo pacientes por doctor',
      error: error.message
    });
  }
};