import { Request, Response } from "express";
import { Consulta } from "../models/consulta";
import { Paciente  } from "../models/paciente";
export const nuevaConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const {motivo, enfermedad_actual, objetivos_terapia, historia_problema, desarrollo, plan_terapeutico,
            tipo_diagnostico, analisis_diagnostico, plan_tratamiento, recomendaciones, numero_documento, fecha,
            correo ,consentimiento_info ,consentimiento_check, abierto} = req.body;

            const paciente = await Paciente.findAll({
                where: {
                    numero_documento: numero_documento,
                },
            });
            if (paciente.length === 0){
                return res.status(404).json({message: "El paciente no existe",});
            }
            const nuevaConsulta = await Consulta.create({
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
                numero_documento,
                fecha,
                correo,
                consentimiento_info,
                consentimiento_check,
                abierto,
            });
            return res.status(201).json(nuevaConsulta);
    } catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }

}
export const getConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.body;
        const consulta = await Consulta.findOne({where: Cid});
        console.log(consulta)
        if(consulta === null) {
            return res.status(404).json({message: 'La consulta no existe'})
        }
        return res.status(200).json(consulta)
    } catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const updateConsulta = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Cid } = req.params;
        const updatedData = req.body;

        if(!Cid) {
            return res.status(400).json({message: "id de la consulta no encontrado"});
        }

        const consulta = await Consulta.findByPk(Cid);
        
        if (!consulta) {
            return res.status(404).json({ message: "Consulta no encontrada" });
        } 
        if (consulta.abierto === false) {
            return res.status(400).json({message: "La consulta ya ha sido cerrada y no se puede actualizar"})
        }

        await consulta.update(updatedData);
        return res.status(200).json(consulta);
    } catch (error) {
        console.error('Error al actualizar la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}