import { Paciente } from "../models/paciente"
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
export const crearPaciente = async (req: Request, res: Response): Promise<any> => {
    const {nombre, apellidos, fecha_nacimiento,sexo, ciudad_nacimiento,edad,tipo_documento,numero_documento,ciudad_expedicion,ciudad_domicilio,barrio,direccion_domicilio,telefono,email,celular,ocupacion,estado_civil,eps,tipo_afiliacion,grupo_sanguineo,rh,alergias,antecedentes,antecedentes_familiares,consentimiento_info}= req.body
    
    try{
        const paciente = await Paciente.findOne({where:{numero_documento}})
        if(paciente){
            return res.status(400).json({
                message: "El paciente ya existe"
            })
        }

        const encryptedData = {
            nombre: await bcrypt.hash(nombre, saltRounds),
            apellidos: await bcrypt.hash(apellidos, saltRounds),
            fecha_nacimiento: await bcrypt.hash(fecha_nacimiento, saltRounds),
            sexo: await bcrypt.hash(sexo, saltRounds),
            ciudad_nacimiento: await bcrypt.hash(ciudad_nacimiento, saltRounds),
            edad: await bcrypt.hash(edad.toString(), saltRounds),
            tipo_documento: await bcrypt.hash(tipo_documento, saltRounds),
            numero_documento: await bcrypt.hash(numero_documento, saltRounds),
            ciudad_expedicion: await bcrypt.hash(ciudad_expedicion, saltRounds),
            ciudad_domicilio: await bcrypt.hash(ciudad_domicilio, saltRounds),
            barrio: await bcrypt.hash(barrio, saltRounds),
            direccion_domicilio: await bcrypt.hash(direccion_domicilio, saltRounds),
            telefono: await bcrypt.hash(telefono, saltRounds),
            email: await bcrypt.hash(email, saltRounds),
            celular: await bcrypt.hash(celular, saltRounds),
            ocupacion: await bcrypt.hash(ocupacion, saltRounds),
            estado_civil: await bcrypt.hash(estado_civil, saltRounds),
            eps: await bcrypt.hash(eps, saltRounds),
            tipo_afiliacion: await bcrypt.hash(tipo_afiliacion, saltRounds),
            grupo_sanguineo: await bcrypt.hash(grupo_sanguineo, saltRounds),
            rh: await bcrypt.hash(rh, saltRounds),
            alergias: await bcrypt.hash(alergias, saltRounds),
            antecedentes: await bcrypt.hash(antecedentes, saltRounds),
            antecedentes_familiares: await bcrypt.hash(antecedentes_familiares, saltRounds),
            consentimiento_info: await bcrypt.hash(consentimiento_info, saltRounds),
        };

        Object.assign(req.body, encryptedData);
        const nuevoPaciente = await Paciente.create({
            nombre,
            apellidos,
            fecha_nacimiento,
            sexo,
            ciudad_nacimiento,
            edad,
            tipo_documento,
            numero_documento,
            ciudad_expedicion,
            ciudad_domicilio,
            barrio,
            direccion_domicilio,
            telefono,
            email,
            celular,
            ocupacion,
            estado_civil,
            eps,
            tipo_afiliacion,
            grupo_sanguineo,
            rh,
            alergias,
            antecedentes,
            antecedentes_familiares,
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
        return res.status(200).json({
            message: "Lista de pacientes",
            data: pacientes,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error obteniendo la lista de pacientes",
            error: err.message,
        });
    }
}

export const obtenerPacienteId = async (req: Request, res: Response): Promise<any> => {

    const { numero_documento } = req.params;
    try {
        const paciente = await Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({
                message: "Paciente no encontrado",
            });
        }
        return res.status(200).json({
            message: "Paciente encontrado",
            data: paciente,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error obteniendo el paciente",
            error: err.message,
        });
    }
}
export const actualizarDatosPaciente = async (req: Request, res: Response): Promise<any> => {  

    const { numero_documento } = req.params;
    const { nombre, apellidos,sexo,edad,tipo_documento,ciudad_expedicion,ciudad_domicilio,barrio,direccion_domicilio,telefono,email,celular,ocupacion,estado_civil,eps,tipo_afiliacion,consentimiento_info}= req.body





}