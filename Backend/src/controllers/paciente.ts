import { Paciente } from "../models/paciente"
import { Request, Response } from "express";
import dotenv from 'dotenv';
import dayjs from "dayjs";
import { decryptData, encryptData } from "./encriptado";
dotenv.config();
export const crearPaciente = async (req: Request, res: Response): Promise<any> => {
    const {nombre, apellidos, fecha_nacimiento,sexo, ciudad_nacimiento,edad,tipo_documento,numero_documento,ciudad_expedicion,ciudad_domicilio,barrio,direccion_domicilio,telefono,email,celular,ocupacion,estado_civil,eps,tipo_afiliacion,grupo_sanguineo,rh,alergias,antecedentes,antecedentes_familiares,consentimiento_info}= req.body
    
    try{
        const paciente = await Paciente.findOne({where:{numero_documento}})
        if(paciente){
            return res.status(400).json({
                message: "El paciente ya existe"
            })
        }
        const fechaFormateada = dayjs(fecha_nacimiento, "YYYY-MM-DD", true);
        if (!fechaFormateada.isValid()) {
            return res.status(400).json({
                message: "El formato de la fecha de nacimiento es inválido. Debe ser YYYY-MM-DD.",
            });
        }
        
        const direccionCifrada = encryptData(direccion_domicilio);
        const alergiasCifradas = encryptData(alergias);
        const antecedentesCifrados = encryptData(antecedentes);
        const antecedentesFamiliaresCifrados = encryptData(antecedentes_familiares);

        const nuevoPaciente = await Paciente.create({
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
            direccion_domicilio:direccionCifrada,
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
            consentimiento_info
        })
        return res.status(201).json({
            message: "Paciente registrado correctamente",
            data: nuevoPaciente,
          });
        } catch (err: any) {
          res.status(500).json({
            message: "Error registrando al paciente ",
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