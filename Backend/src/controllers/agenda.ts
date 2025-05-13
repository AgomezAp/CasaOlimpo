import { Request, Response } from "express";
import { Agenda } from "../models/agenda";
import { User } from "../models/user";
import { Paciente } from "../models/paciente";
import dayjs from "dayjs";
import { Op } from "sequelize"; // Importar operadores de Sequelize
import sequelize from "../database/connection";
import { AgendaNoRegistrados } from "../models/agendaNoRegistrados";
import { decryptData, encryptData } from "./encriptado";
import { desencriptarPacienteCompleto } from './paciente';
function desencriptarAgenda(agenda: any): any {
  if (!agenda) return agenda;
  
  // Lista de campos que NO requieren desencriptación
  const camposSinDesencriptar = [
    'Aid', 'fecha_cita', 'hora_cita', 'estado', 'correo',
    'numero_documento', 'createdAt', 'updatedAt', 'duracion'
  ];
  
  // Clonar el objeto para no modificar el original
  const agendaDesencriptada = { ...agenda };
  
  // Desencriptar todos los campos excepto los que están en la lista de exclusión
  Object.keys(agendaDesencriptada).forEach(campo => {
    if (!camposSinDesencriptar.includes(campo) && agendaDesencriptada[campo]) {
      try {
        // Verificar si parece un texto encriptado
        if (typeof agendaDesencriptada[campo] === 'string' && 
            agendaDesencriptada[campo].match(/^[A-Za-z0-9+/=]{20,}$/)) {
          agendaDesencriptada[campo] = decryptData(agendaDesencriptada[campo]);
        }
      } catch (error) {
        console.error(`Error al desencriptar campo ${campo} en agenda:`, error);
      }
    }
  });
  
  return agendaDesencriptada;
}
export const crearCita = async (req: Request, res: Response): Promise<any> => {
  const {
    correo,
    numero_documento,
    fecha_cita,
    hora_cita,
    estado,
    descripcion,
    telefono,
    duracion,
  } = req.body;

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

    // Validaciones de doctor y paciente...
    const doctor = await User.findOne({ where: { correo } });
    if (!doctor) {
      return res.status(404).json({
        message: "El doctor con el correo proporcionado no existe.",
      });
    }

    const paciente = await Paciente.findOne({ where: { numero_documento } });
    if (!paciente) {
      return res.status(404).json({
        message:
          "El paciente con el número de documento proporcionado no existe.",
      });
    }

    // Verificar cita exacta en la misma hora
    const citaExistente = await Agenda.findOne({
      where: {
        fecha_cita: fechaFormateada.toDate(),
        hora_cita,
        correo,
      },
    });

    if (citaExistente) {
      return res.status(400).json({
        message:
          "Ya existe una cita programada para el doctor en la misma fecha y hora.",
      });
    }
// VERIFICACIÓN CRUZADA: Verificar solapamiento con pacientes NO REGISTRADOS
const fechaStr = fechaFormateada.format('YYYY-MM-DD');
const citaNoRegistradaExistente = await AgendaNoRegistrados.findOne({
  where: {
    correo,
    [Op.and]: [
      sequelize.where(sequelize.fn("DATE", sequelize.col("fecha_cita")), fechaStr),
      { hora_cita }
    ]
  }
});

if (citaNoRegistradaExistente) {
  return res.status(400).json({
    message: "Ya existe una cita programada para el doctor en la misma fecha y hora con un paciente no registrado."
  });
}

// VERIFICACIÓN CRUZADA: Obtener citas de NO REGISTRADOS del mismo día
const citasNoRegistradasDelDia = await AgendaNoRegistrados.findAll({
  where: {
    correo,
    [Op.and]: [
      sequelize.where(sequelize.fn("DATE", sequelize.col("fecha_cita")), fechaStr)
    ]
  },
  raw: true
});


// Usar todasLasCitasDelDia en lugar de citasDelDia para la verificación de 30 minutos
    // NUEVA VALIDACIÓN: Verificar separación de 30 minutos entre citas
    // 1. Obtener todas las citas del médico para ese día
    const citasDelDia = await Agenda.findAll({
      where: {
        correo,
        fecha_cita: fechaFormateada.toDate(),
      },
    });
    const todasLasCitasDelDia = [...citasDelDia, ...citasNoRegistradasDelDia];

    // 2. Convertir la hora de la nueva cita a minutos para comparación
    const [horaStr, minutosStr] = hora_cita.split(":");
    const nuevaCitaMinutos = parseInt(horaStr) * 60 + parseInt(minutosStr);

    // 3. Verificar si hay alguna cita demasiado cercana (menos de 30 minutos)
    const citaDemasiadoCercana = todasLasCitasDelDia.some((cita) => {
      const [horaExistente, minutosExistente] = cita.hora_cita.split(":");
      const citaExistenteMinutos =
        parseInt(horaExistente) * 60 + parseInt(minutosExistente);

      // Calcular la diferencia absoluta en minutos
      const diferencia = Math.abs(nuevaCitaMinutos - citaExistenteMinutos);

      // Si la diferencia es menor a 30 minutos, la cita está demasiado cercana
      return diferencia < 30;
    });

    if (citaDemasiadoCercana) {
      return res.status(400).json({
        message:
          "No se puede programar la cita. Debe haber al menos 30 minutos entre citas para el mismo doctor.",
      });
    }

    // Crear la cita solo si pasa todas las validaciones
    const nuevaCita = await Agenda.create({
      correo,
      numero_documento,
      fecha_cita: fechaFormateada.toDate(),
      hora_cita,
      estado: estado || "Pendiente",
      descripcion,
      telefono,
      duracion 
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

export const actualizarCita = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { Aid } = req.params;
  const datosActualizados = req.body;

  try {
    // 1. Verificar si la cita existe
    const cita = await Agenda.findByPk(Aid);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    // 2. Preparar campos a actualizar
    const actualizaciones: any = {};

    // 3. Validar y preparar todos los campos que se van a actualizar

    // Fecha
    let fechaParaValidar = cita.fecha_cita; // Valor actual por defecto
    if (datosActualizados.fecha_cita) {
      const fechaFormateada = dayjs(datosActualizados.fecha_cita, "YYYY-MM-DD");
      if (!fechaFormateada.isValid()) {
        return res
          .status(400)
          .json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
      }
      actualizaciones.fecha_cita = fechaFormateada.toDate();
      fechaParaValidar = fechaFormateada.toDate();
    }

    // Hora
    let horaParaValidar = cita.hora_cita; // Valor actual por defecto
    if (datosActualizados.hora_cita) {
      const horaRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
      if (!horaRegex.test(datosActualizados.hora_cita)) {
        return res
          .status(400)
          .json({ message: "Formato de hora inválido. Use HH:MM o HH:MM:SS" });
      }
      actualizaciones.hora_cita = datosActualizados.hora_cita;
      horaParaValidar = datosActualizados.hora_cita;
    }

    // Doctor (correo)
    let correoParaValidar = cita.correo; // Valor actual por defecto
    if (datosActualizados.correo) {
      const doctor = await User.findOne({
        where: { correo: datosActualizados.correo },
      });
      if (!doctor) {
        return res
          .status(404)
          .json({ message: "El doctor con el correo proporcionado no existe" });
      }
      actualizaciones.correo = datosActualizados.correo;
      correoParaValidar = datosActualizados.correo;
    }

    // Estado
    if (datosActualizados.estado !== undefined) {
      const estadosValidos = ["Confirmada", "Cancelada", "Pendiente"];
      if (!estadosValidos.includes(datosActualizados.estado)) {
        return res
          .status(400)
          .json({
            message: "Estado inválido. Use: Confirmada, Cancelada o Pendiente",
          });
      }
      actualizaciones.estado = datosActualizados.estado;
    }

    // Descripción - Encriptar al actualizar
    if (datosActualizados.descripcion !== undefined) {
      actualizaciones.descripcion = encryptData(datosActualizados.descripcion);
    }
    
    // Teléfono - Encriptar al actualizar
    if (datosActualizados.telefono !== undefined) {
      actualizaciones.telefono = encryptData(datosActualizados.telefono);
    }
    
    // Duración
    if (datosActualizados.duracion !== undefined) {
      actualizaciones.duracion = datosActualizados.duracion;
    }

    // 4. Si no hay nada que actualizar, retornar error
    if (Object.keys(actualizaciones).length === 0) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar" });
    }

    // 5. Si se está cambiando fecha, hora o doctor, realizar validaciones
    if (
      datosActualizados.fecha_cita ||
      datosActualizados.hora_cita ||
      datosActualizados.correo
    ) {
      console.log("—— INFORMACIÓN DE VALIDACIÓN ——");
      console.log(
        `Fecha para validar: ${dayjs(fechaParaValidar).format("YYYY-MM-DD")}`
      );
      console.log(`Hora para validar: ${horaParaValidar}`);
      console.log(`Correo para validar: ${correoParaValidar}`);

      const fechaStr = dayjs(fechaParaValidar).format("YYYY-MM-DD");

      // CLAVE: Usar Sequelize.literal para filtrar por fecha correctamente
      const citasEnMismoDia = await Agenda.findAll({
        where: {
          correo: correoParaValidar,
          Aid: { [Op.ne]: Aid }, // Excluir la cita actual
          [Op.and]: [
            sequelize.where(
              sequelize.fn("DATE", sequelize.col("fecha_cita")),
              fechaStr
            ),
          ],
        },
        raw: true,
      });

      console.log(
        `Encontradas ${citasEnMismoDia.length} citas en el mismo día`
      );

      // Verificar si hay citas en la misma hora
      const citasMismaHora = citasEnMismoDia.filter((c) => {
        const horaActual = horaParaValidar.split(":").slice(0, 2).join(":");
        const horaCita = c.hora_cita.split(":").slice(0, 2).join(":");
        console.log(
          `Comparando horas - Actual: ${horaActual}, Cita: ${horaCita}`
        );
        return horaActual === horaCita;
      });
      const citasNoRegistradasDelDia = await AgendaNoRegistrados.findAll({
        where: {
          correo: correoParaValidar,
          [Op.and]: [
            sequelize.where(
              sequelize.fn("DATE", sequelize.col("fecha_cita")),
              fechaStr
            )
          ]
        },
        raw: true
      });
      
      console.log(`Encontradas ${citasNoRegistradasDelDia.length} citas de pacientes no registrados`);
      
      // Combinar todas las citas para verificación
      const todasLasCitasDelDia = [
        ...citasEnMismoDia,
        ...citasNoRegistradasDelDia
      ];
      
      if (citasMismaHora.length > 0) {
        console.log("¡CONFLICTO! Cita en la misma hora:", citasMismaHora);
        return res.status(400).json({
          message:
            "Ya existe una cita programada para el doctor en la misma fecha y hora",
        });
      }

      // Verificar proximidad (30 minutos)
      const [horaActualStr, minutosActualStr] = horaParaValidar.split(":");
      const nuevaCitaMinutos =
        parseInt(horaActualStr) * 60 + parseInt(minutosActualStr);

      // Log para depuración
      console.log(`Hora actual en minutos: ${nuevaCitaMinutos}`);

      // Verificar cada cita para ver si está a menos de 30 minutos
      for (const c of todasLasCitasDelDia) {
        const [horaCitaStr, minutosCitaStr] = c.hora_cita.split(":");
        const citaMinutos =
          parseInt(horaCitaStr) * 60 + parseInt(minutosCitaStr);
        const diferencia = Math.abs(nuevaCitaMinutos - citaMinutos);

        console.log(
          `Cita existente: ${c.hora_cita} (${citaMinutos} min), Diferencia: ${diferencia} min`
        );

        if (diferencia < 30) {
          console.log(
            `¡CONFLICTO! Cita demasiado cercana: ${c.hora_cita}, Diferencia: ${diferencia} min`
          );
          return res.status(400).json({
            message:
              "No se puede actualizar la cita. Debe haber al menos 30 minutos entre citas para el mismo doctor",
          });
        }
      }
    }

    // 6. Actualizar la cita con los campos proporcionados
    await cita.update(actualizaciones);
    
    // 7. Obtener la cita actualizada para desencriptarla
    const citaActualizada = await Agenda.findByPk(Aid, {
      include: [
        { model: User, as: "doctor" },
        { model: Paciente, as: "paciente" }
      ]
    });
    
    if (!citaActualizada) {
      return res.status(404).json({
        message: "Error al obtener la cita actualizada"
      });
    }
    
    // 8. Desencriptar datos para la respuesta
    const citaJSON = citaActualizada.toJSON();
    const citaDesencriptada = desencriptarAgenda(citaJSON);

    return res.status(200).json({
      message: "Cita actualizada correctamente",
      data: citaDesencriptada,
    });
  } catch (err: any) {
    console.error("Error actualizando cita:", err);
    res.status(500).json({
      message: "Error actualizando la cita",
      error: err.message,
    });
  }
};

export const eliminarCita = async (req: Request, res: Response): Promise<any> => {
  const { Aid } = req.params;

  try {
    // Buscar la cita por su ID
    const cita = await Agenda.findByPk(Aid);
    if (!cita) {
      return res.status(404).json({
        message: "Cita no encontrada"
      });
    }

    // Eliminar SOLO esta cita específica
    await cita.destroy();

    return res.status(200).json({
      message: `La cita con ID ${Aid} ha sido eliminada correctamente.`
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error eliminando la cita",
      error: err.message
    });
  }
};
export const obtenerCitas = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Si estás usando req.params.correo o req.params.numero_documento
    // asegúrate de que sea string:
    const { correo, numero_documento } = req.params;

    // Busca con los tipos correctos
    const citas = await Agenda.findAll({
      where: {
        // Asegúrate que los valores sean del tipo correcto
        ...(correo && { correo: String(correo) }),
        ...(numero_documento && { numero_documento: String(numero_documento) }),
      },
      include: [
        { model: User, as: "doctor" },
        { model: Paciente, as: "paciente" },
      ],
    });

    // Desencriptar los datos de todas las citas
    const citasDesencriptadas = citas.map(cita => {
      const citaJSON = cita.toJSON();
      const citaDesencriptada = desencriptarAgenda(citaJSON);
      
      // Si el paciente tiene datos encriptados y existe la función para desencriptarlos
      if (citaDesencriptada.paciente && typeof desencriptarPacienteCompleto === 'function') {
        citaDesencriptada.paciente = desencriptarPacienteCompleto(citaDesencriptada.paciente);
      }
      
      return citaDesencriptada;
    });

    return res.status(200).json({
      message: "Citas obtenidas correctamente",
      data: citasDesencriptadas,
    });
  } catch (err: any) {
    console.error("Error obteniendo las citas:", err);
    res.status(500).json({
      message: "Error obteniendo las citas",
      error: err.message,
    });
  }
};
export const obtenerCitasPorDoctor = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { numero_documento } = req.params;
  try {
    const citas = await Agenda.findAll({
      where: {
        numero_documento: numero_documento,
      },
      include: [
        { model: User, as: "doctor" },
        { model: Paciente, as: "paciente" },
      ],
    });
    
    // Desencriptar los datos de todas las citas
    const citasDesencriptadas = citas.map(cita => {
      const citaJSON = cita.toJSON();
      const citaDesencriptada = desencriptarAgenda(citaJSON);
      
      // Si hay datos de paciente disponibles
      if (citaDesencriptada.paciente && typeof desencriptarPacienteCompleto === 'function') {
        citaDesencriptada.paciente = desencriptarPacienteCompleto(citaDesencriptada.paciente);
      }
      
      return citaDesencriptada;
    });
    
    return res.status(200).json({
      message: "Citas obtenidas correctamente",
      data: citasDesencriptadas,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error obteniendo las citas",
      error: err.message,
    });
  }
};
/**
 * Obtiene todas las citas de un paciente por su número de documento
 */
export const obtenerCitasPorPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { numero_documento } = req.params;

    if (!numero_documento) {
      return res.status(400).json({
        message: "Se requiere el número de documento del paciente"
      });
    }

    // Buscar todas las citas del paciente
    const citas = await Agenda.findAll({
      where: {
        numero_documento
      },
      // MODIFICAR ESTA LÍNEA - Eliminar 'telefono' del array de atributos
      attributes: ['Aid', 'fecha_cita', 'hora_cita', 'estado', 'descripcion', 'duracion'],
      include: [
        { 
          model: User, 
          as: "doctor",
          attributes: ['nombre'] 
        }
      ],
      order: [
        ['fecha_cita', 'ASC'],
        ['hora_cita', 'ASC']
      ]
    });

    if (citas.length === 0) {
      return res.status(200).json({
        message: "El paciente no tiene citas programadas",
        data: []
      });
    }

    // Desencriptar cada cita antes de enviarla
    const citasDesencriptadas = citas.map(cita => 
      desencriptarAgenda(cita.toJSON())
    );

    return res.status(200).json({
      message: "Citas del paciente obtenidas correctamente",
      total_citas: citas.length,
      data: citasDesencriptadas
    });
  } catch (err: any) {
    console.error("Error obteniendo las citas del paciente:", err);
    return res.status(500).json({
      message: "Error al obtener las citas del paciente",
      error: err.message
    });
  }
};
export const getHorasOcupadas = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { fecha } = req.params;
    
    // Validar formato de fecha
    const fechaFormateada = dayjs(fecha, "YYYY-MM-DD");
    if (!fechaFormateada.isValid()) {
      return res.status(400).json({
        message: "Formato de fecha inválido. Use YYYY-MM-DD",
        data: []
      });
    }
    
    const fechaStr = fechaFormateada.format('YYYY-MM-DD');
    
    // Obtener citas de pacientes registrados
    const citasRegistradas = await Agenda.findAll({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn("DATE", sequelize.col("fecha_cita")), fechaStr)
        ]
      },
      attributes: ['hora_cita', 'duracion'],
      raw: true
    });
    
    // Obtener citas de pacientes no registrados
    const citasNoRegistradas = await AgendaNoRegistrados.findAll({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn("DATE", sequelize.col("fecha_cita")), fechaStr)
        ]
      },
      attributes: ['hora_cita', 'duracion'],
      raw: true
    });
    
    // Combinar todas las citas
    const todasLasCitas = [...citasRegistradas, ...citasNoRegistradas];
    
    // Extraer horas ocupadas considerando la duración de cada cita
    const horasOcupadas = new Set<string>();
    
    todasLasCitas.forEach(cita => {
      // Hora base de la cita
      const [horas, minutos] = cita.hora_cita.split(':').map(Number);
      let citaMinutos = horas * 60 + minutos;
      
      // Duración de la cita (por defecto 30 minutos si no está definida)
      const duracion = cita.duracion || 30;
      
      // Añadir la hora base
      horasOcupadas.add(cita.hora_cita.substring(0, 5));
      
      // Añadir intervalos de 30 minutos durante la duración de la cita
      for (let i = 30; i < duracion; i += 30) {
        const nuevoMinuto = citaMinutos + i;
        const nuevaHora = Math.floor(nuevoMinuto / 60).toString().padStart(2, '0');
        const nuevoMinutoStr = (nuevoMinuto % 60).toString().padStart(2, '0');
        horasOcupadas.add(`${nuevaHora}:${nuevoMinutoStr}`);
      }
    });
    
    // Convertir Set a Array para la respuesta
    const horasOcupadasArray = Array.from(horasOcupadas).sort();
    
    return res.status(200).json({
      message: "Horas ocupadas obtenidas correctamente",
      data: horasOcupadasArray
    });
    
  } catch (err: any) {
    console.error("Error obteniendo horas ocupadas:", err);
    return res.status(500).json({
      message: "Error al obtener horas ocupadas",
      error: err.message,
      data: []
    });
  }
};