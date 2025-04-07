import { Request, Response } from 'express';
import { Paciente } from '../models/paciente';
import { Op, Sequelize } from 'sequelize';
import schedule from 'node-schedule';

export const enviarMensaje = async (req: Request, res: Response): Promise<any> => {
    try {
        const {  phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message } = req.body;
        // Validar que todos los campos requeridos estén presentes
        if (!phoneNumberCliente || !phoneNumberMaestro || !nombreDelCliente || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        // Llamar a la API externa para enviar el mensaje
        const apiResponse = await fetch('https://gestor-de-mesajeria-via-whatsapp-g5hc.onrender.com/api/messages/CrearMensaje', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Origin': `181.129.218.198`
            },
            body: JSON.stringify({
                sessionId: "1234",
                phoneNumberCliente: phoneNumberCliente,
                phoneNumberMaestro: phoneNumberMaestro,
                nombreDelCliente: nombreDelCliente,
                message: message
            })
        });

        // Verificar la respuesta de la API
        if (!apiResponse.ok) {
            const errorResponse = await apiResponse.json();
            return res.status(apiResponse.status).json({ error: errorResponse.message || 'Error al enviar el mensaje.' });
        }

        const apiResult = await apiResponse.json();
        // Simulación de envío de mensaje a través de una API externa
        const mensajeEnviado = {
            sessionId: "1234",
            to: phoneNumberMaestro,
            from: phoneNumberCliente,
            nombreDelCliente,
            message,
            status: 'Mensaje enviado exitosamente',
        };
        // Responder con el resultado del envío
        return res.status(200).json(mensajeEnviado);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const obtenerFecha = async (req: Request, res: Response): Promise<any> => {
    try {
        const fechaActual = new Date();
        const diaSemana = fechaActual.toLocaleString('es-ES', { weekday: 'long' });
        const mes = (fechaActual.getMonth()+1).toString().padStart(2, '0');
        const dia = (fechaActual.getDate().toString().padStart(2,'0'));
        const clienteConMismaFecha = await Paciente.findAll({
            where: Sequelize.where(
                Sequelize.fn('TO_CHAR', Sequelize.col('fecha_nacimiento'), 'MM-DD'),
                `${mes}-${dia}`
            )
        });

        if (clienteConMismaFecha.length > 0) {
            return res.status(200).json({pacientes: clienteConMismaFecha });
        }
        return res.status(200).json({message: 'No hay pacientes cumpliendo años hoy.' });
    } catch (error) {
        console.error('Error al obtener la fecha:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const programarEnvio = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Programar una tarea diaria a las 8:00 AM
        schedule.scheduleJob('0 8 * * *', async () => {
        try {
            const fechaActual = new Date();
            const diaSemana = fechaActual.toLocaleString('es-ES', { weekday: 'long' });
            const clienteConMismaFecha = await Paciente.findOne({
                where: {
                    fecha_nacimiento: {
                        [Op.like]: `%${fechaActual.getMonth() + 1}-${fechaActual.getDate()}%`
                    }
                }
            });
            if (clienteConMismaFecha) {
                console.log(`Hoy es ${diaSemana}. Cliente con misma fecha: ${clienteConMismaFecha.nombre}`);
                // Aquí puedes agregar lógica para enviar un mensaje o realizar otra acción
            } else {
                        console.log(`Hoy es ${diaSemana}. No hay clientes con esta fecha.`);
                    }
            } catch (error) {
                    console.error('Error al ejecutar la tarea programada:', error);
            }
        });
        return res.status(200).json({ message: 'Tarea programada exitosamente.' });
        } catch (error) {
            console.error('Error al programar la tarea:', error);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
    };