import { Request, Response } from 'express';
import { Receta } from '../models/receta';
import { Consulta } from '../models/consulta';
import { Paciente } from '../models/paciente';
import dayjs from 'dayjs';
import { User } from '../models/user';

// Obtener todas las recetas
export const obtenerRecetas = async (req: Request, res: Response): Promise<any> => {
    try {
      const recetas = await Receta.findAll({
        include: [
          { 
            model: Consulta, 
            as: 'consulta',
            include: [{ model: Paciente, as: 'paciente' }]
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['Uid', 'nombre', 'apellido', 'especialidad']
          }
        ],
        order: [['fecha_emision', 'DESC']]
      });
      
      return res.status(200).json({
        message: 'Recetas obtenidas correctamente',
        data: recetas
      });
    } catch (error: any) {
      console.error('Error obteniendo recetas:', error);
      return res.status(500).json({
        message: 'Error obteniendo las recetas',
        error: error.message
      });
    }
  };
  
  // Crear receta (con validación de una sola receta activa)
  export const crearReceta = async (req: Request, res: Response): Promise<any> => {
    try {
      const { 
        Cid, // Usando Cid en lugar de ConsultaId (basado en tu modelo)
        medicamentos, 
        instrucciones,
        duracion_tratamiento,
        diagnostico,
        observaciones,
        anotaciones
      } = req.body;
      
      // Obtener el Uid del token (usuario autenticado)
      const Uid = req.body.usuarioAutenticado.Uid;
      
      // Verificar que la consulta existe
      const consulta = await Consulta.findByPk(Cid);
      
      if (!consulta) {
        return res.status(404).json({ message: 'Consulta no encontrada' });
      }
      
      // Obtener el número de documento del paciente
      const numero_documento = consulta.numero_documento;
      
      // Buscar recetas activas para este paciente
      const recetasActivas = await Receta.findAll({
        where: {
          numero_documento,
          estado: 'ACTIVA'
        }
      });
      
      // Cambiar el estado de las recetas previas a COMPLETADA
      if (recetasActivas.length > 0) {
        await Promise.all(
          recetasActivas.map(async (receta) => {
            await receta.update({
              estado: 'COMPLETADA',
              // Opcional: añadir un campo para registrar cuándo/por qué se completó
              observaciones: receta.observaciones 
                ? `${receta.observaciones}\n[AUTO] Completada al crear nueva receta el ${new Date().toISOString()}`
                : `[AUTO] Completada al crear nueva receta el ${new Date().toISOString()}`
            });
          })
        );
      }
      
      // Crear la nueva receta
      const nuevaReceta = await Receta.create({
        Cid,         // Usar Cid en lugar de ConsultaId
        Uid,         // Médico que emite la receta
        numero_documento,
        medicamentos,
        instrucciones,
        duracion_tratamiento,
        diagnostico,
        observaciones,
        anotaciones,
        fecha_emision: new Date(),
        estado: 'ACTIVA',
        editada: false
      });
      
      return res.status(201).json({
        message: 'Receta creada correctamente. Recetas previas marcadas como completadas.',
        data: nuevaReceta,
        recetasCompletadas: recetasActivas.length
      });
    } catch (error: any) {
      console.error('Error creando receta:', error);
      return res.status(500).json({
        message: 'Error creando la receta',
        error: error.message
      });
    }
  };
  
  // Editar receta con restricción de tiempo (48 horas)
  export const editarReceta = async (req: Request, res: Response): Promise<any> => {
    try {
      const { recetaId } = req.params;
      const { 
        medicamentos, 
        instrucciones,
        duracion_tratamiento,
        diagnostico,
        observaciones,
        anotaciones
      } = req.body;
      
      // Obtener el Uid del token (usuario autenticado)
      const Uid = req.body.usuarioAutenticado.Uid;
      
      // Buscar la receta
      const receta = await Receta.findByPk(recetaId);
      
      if (!receta) {
        return res.status(404).json({ message: 'Receta no encontrada' });
      }
      
      // Verificar que la receta está activa
      if (receta.estado !== 'ACTIVA') {
        return res.status(403).json({ 
          message: `No se puede editar la receta porque su estado es ${receta.estado}`
        });
      }
      
      // Verificar tiempo límite (48 horas desde emisión)
      const fechaEmision = dayjs(receta.fecha_emision);
      const ahora = dayjs();
      const horasTranscurridas = ahora.diff(fechaEmision, 'hour');
      
      // Restricción de 48 horas para edición
      if (horasTranscurridas > 48) {
        return res.status(403).json({ 
          message: 'No se puede editar la receta después de 48 horas de su emisión',
          tiempoTranscurrido: `${horasTranscurridas} horas`
        });
      }
      
      // Actualizar receta
      await receta.update({
        medicamentos: medicamentos ?? receta.medicamentos,
        instrucciones: instrucciones ?? receta.instrucciones,
        duracion_tratamiento: duracion_tratamiento ?? receta.duracion_tratamiento,
        diagnostico: diagnostico ?? receta.diagnostico,
        observaciones: observaciones ?? receta.observaciones,
        anotaciones: anotaciones ?? receta.anotaciones,
        Uid: Uid, // Actualizar al médico que editó la receta
        editada: true
      });
      
      return res.status(200).json({
        message: 'Receta actualizada correctamente',
        data: receta
      });
    } catch (error: any) {
      console.error('Error actualizando receta:', error);
      return res.status(500).json({
        message: 'Error actualizando la receta',
        error: error.message
      });
    }
  };
  
  // Método adicional para completar manualmente una receta
  export const completarReceta = async (req: Request, res: Response): Promise<any> => {
    try {
      const { recetaId } = req.params;
      const { motivo } = req.body;
      
      // Buscar la receta
      const receta = await Receta.findByPk(recetaId);
      
      if (!receta) {
        return res.status(404).json({ message: 'Receta no encontrada' });
      }
      
      // Verificar que la receta está activa
      if (receta.estado !== 'ACTIVA') {
        return res.status(400).json({
          message: `La receta ya está ${receta.estado}`
        });
      }
      
      // Actualizar estado y agregar observación
      let observaciones = receta.observaciones || '';
      if (motivo) {
        observaciones += `\n[${new Date().toISOString()}] Completada: ${motivo}`;
      }
      
      await receta.update({
        estado: 'COMPLETADA',
        observaciones
      });
      
      return res.status(200).json({
        message: 'Receta marcada como completada',
        data: receta
      });
    } catch (error: any) {
      console.error('Error completando receta:', error);
      return res.status(500).json({
        message: 'Error completando la receta',
        error: error.message
      });
    }
  };
  
  // Método para obtener recetas activas de un paciente
  export const obtenerRecetasActivas = async (req: Request, res: Response): Promise<any> => {
    try {
      const { numero_documento } = req.params;
      
      const recetas = await Receta.findAll({
        where: {
          numero_documento,
          estado: 'ACTIVA'
        },
        include: [
          { 
            model: Consulta, 
            as: 'consulta'
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['Uid', 'nombre', 'apellido', 'especialidad']
          }
        ],
        order: [['fecha_emision', 'DESC']]
      });
      
      return res.status(200).json({
        message: 'Recetas activas obtenidas correctamente',
        data: recetas
      });
    } catch (error: any) {
      console.error('Error obteniendo recetas activas:', error);
      return res.status(500).json({
        message: 'Error obteniendo recetas activas',
        error: error.message
      });
    }
  };