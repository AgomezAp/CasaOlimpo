import { Request, Response } from "express";
import { Agenda } from "../models/agenda";
import { User } from "../models/user";
import { Paciente } from "../models/paciente";
import dayjs from "dayjs";


export const crearCita = async (req: Request, res: Response): Promise<any> => {
  const { correo, numero_documento, fecha_cita, hora_cita, estado } = req.body;

  try {
    // Formatear y validar fecha primero
    const fechaFormateada = dayjs(fecha_cita, "YYYY-MM-DD");
    if (!fechaFormateada.isValid()) {
        return res.status(400).json({
            message: "Formato de fecha inválido. Use YYYY-MM-DD",
        });
    }
    
    // Validar formato de hora
    const horaRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
    if (!horaRegex.test(hora_cita)) {
        return res.status(400).json({
            message: "Formato de hora inválido. Use HH:MM o HH:MM:SS",
        });
    }

    // Validar si el doctor existe
    const doctor = await User.findOne({ where: { correo } });
    if (!doctor) {
      return res.status(404).json({
        message: "El doctor con el correo proporcionado no existe.",
      });
    }

    // Validar si el paciente existe
    const paciente = await Paciente.findOne({ where: { numero_documento } });
    if (!paciente) {
      return res.status(404).json({
        message: "El paciente con el número de documento proporcionado no existe.",
      });
    }

    // AQUÍ ESTÁ LA CORRECCIÓN - Usar la fecha formateada para verificar solapamiento
    const citaExistente = await Agenda.findOne({
      where: {
        fecha_cita: fechaFormateada.toDate(), // Usar fecha formateada
        hora_cita,
        correo,
      },
    });
    
    if (citaExistente) {
      return res.status(400).json({
        message: "Ya existe una cita programada para el doctor en la misma fecha y hora.",
      });
    }
    
    // Crear la cita con fecha formateada
    const nuevaCita = await Agenda.create({
      correo,
      numero_documento,
      fecha_cita: fechaFormateada.toDate(), // Guardar con formato correcto
      hora_cita,
      estado: estado || "Pendiente", // Valor por defecto
    });

    return res.status(201).json({
      message: "Cita creada correctamente",
      data: nuevaCita,
    });
  } catch (err: any) {
    console.error("Error creando cita:", err);
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
      // Si estás usando req.params.correo o req.params.numero_documento
      // asegúrate de que sea string:
      const { correo, numero_documento } = req.params;
      
      // Busca con los tipos correctos
      const citas = await Agenda.findAll({
          where: {
              // Asegúrate que los valores sean del tipo correcto
              ...(correo && { correo: String(correo) }),
              ...(numero_documento && { numero_documento: String(numero_documento) })
          },
          include: [
              { model: User, as: "doctor" },
              { model: Paciente, as: "paciente" }
          ]
      });

      return res.status(200).json({
          message: "Citas obtenidas correctamente",
          data: citas
      });
  } catch (err: any) {
      console.error("Error obteniendo las citas:", err);
      res.status(500).json({
          message: "Error obteniendo las citas",
          error: err.message
      });
  }
};

export const obtenerCitasPorDoctor = async (req: Request, res: Response): Promise<any> => {
  const {numero_documento} = req.params;
  try {
    const citas = await Agenda.findAll({
      where: {
        numero_documento: numero_documento,
      },
      include: [
        { model: User, as: "doctor" },
        { model: Paciente, as: "paciente" }
      ]
    });
    return res.status(200).json({
      message: "Citas obtenidas correctamente",
      data: citas,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error obteniendo las citas",
      error: err.message,
    });
  }
}
