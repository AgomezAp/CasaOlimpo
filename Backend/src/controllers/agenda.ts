import { Request, Response } from "express";
import { Agenda } from "../models/agenda";
import { User } from "../models/user";
import { Paciente } from "../models/paciente";


export const crearCita = async (req: Request, res: Response): Promise<any> => {
    const { correo, numero_documento, fecha_cita, hora_cita, estado } = req.body;
  
    try {
      // Validar si el doctor (User) existe
      const doctor = await User.findOne({ where: { correo } });
      if (!doctor) {
        return res.status(404).json({
          message: "El doctor con el correo proporcionado no existe.",
        });
      }
  
      // Validar si el paciente (Paciente) existe
      const paciente = await Paciente.findOne({ where: { numero_documento } });
      if (!paciente) {
        return res.status(404).json({
          message: "El paciente con el número de documento proporcionado no existe.",
        });
      }
  
      // Validar si ya existe una cita en la misma fecha y hora para el mismo doctor
      const citaExistente = await Agenda.findOne({
        where: {
          fecha_cita,
          hora_cita,
          correo, // Validar que no haya solapamiento para el mismo doctor
        },
      });
  
      if (citaExistente) {
        return res.status(400).json({
          message: "Ya existe una cita programada para el doctor en la misma fecha y hora.",
        });
      }
  
      // Crear la nueva cita si no hay solapamiento
      const nuevaCita = await Agenda.create({
        correo,
        numero_documento,
        fecha_cita,
        hora_cita,
        estado,
      });
  
      return res.status(201).json({
        message: "Cita creada correctamente",
        data: nuevaCita,
      });
    } catch (err: any) {
      res.status(500).json({
        message: "Error creando la cita",
        error: err.message,
      });
    }
  };

  export const actualizarCita = async (req: Request, res: Response): Promise<any> => {

    const { Aid } = req.params;
    const { correo, fecha_cita, hora_cita, estado } = req.body;
    try {
        const cita = await Agenda.findByPk(Aid);
        if (!cita) {
            return res.status(404).json({
                message: "Cita no encontrada",
            });
        }
        cita.correo = correo;
        cita.fecha_cita = fecha_cita;
        cita.hora_cita = hora_cita;
        cita.estado = estado;
        await cita.save();
        return res.status(200).json({
            message: "Cita actualizada correctamente",
            data: cita,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error actualizando la cita",
            error: err.message,
        });
    }
}
export const eliminarCita = async (req: Request, res: Response): Promise<any> => {
    const { Aid } = req.params;

    try {
        // Buscar la cita por su ID
        const cita = await Agenda.findByPk(Aid);
        if (!cita) {
            return res.status(404).json({
                message: "Cita no encontrada",
            });
        }

        // Obtener el correo del doctor y el número de documento del paciente asociados a la cita
        const correoUsuario = cita.correo;
        const numeroDocumentoPaciente = cita.numero_documento;

        // Eliminar todas las citas asociadas al doctor y al paciente
        await Agenda.destroy({
            where: {
                correo: correoUsuario,
                numero_documento: numeroDocumentoPaciente,
            },
        });

        return res.status(200).json({
            message: `Todas las citas asociadas al doctor con correo ${correoUsuario} y al paciente con número de documento ${numeroDocumentoPaciente} han sido eliminadas.`,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error eliminando las citas",
            error: err.message,
        });
    }
};
export const obtenerCitas = async (req: Request, res: Response): Promise<any> => {
    try {
        const citas = await Agenda.findAll({
            include: [
                {
                    model: User,
                    as: 'doctor', 
                    attributes: ['nombre', 'apellido'], 
                },
                {
                    model: Paciente,
                    as: 'paciente', 
                    attributes: ['nombre', 'apellido', 'telefono'], 
                },
            ],
        });

        return res.status(200).json(citas);
    } catch (err: any) {
        res.status(500).json({
            message: "Error obteniendo las citas",
            error: err.message,
        });
    }
};
