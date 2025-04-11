import { Request, Response } from 'express';
import { Paciente } from '../models/paciente';
import { Descuento } from '../models/descuento';

export const enviarDescuento = async (req: Request, res: Response): Promise<any> => {
    try {
        // const { mensaje } = req.body;
        const numeros = await Paciente.findAll({
            attributes: ['nombre', 'apellidos', 'celular']
        });
        for (const num of numeros){
            const newBody = JSON.stringify({
                sessionId: "1234",
                phoneNumberCliente: '',
                phoneNumberMaestro: `57${num.celular}`, //numero que va a recibir el mensaje
                nombreDelCliente: `${num.nombre} ${num.apellidos}`, 
                message : `${num.nombre}`
            })
            const message = await fetch('https://gestor-de-mesajeria-via-whatsapp-g5hc.onrender.com/api/message/CrearMensaje', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: newBody
            }); 
        }
    }
    catch (error) {
    }
}
export const crearDescuento = async (req: Request, res: Response): Promise<any> => {
    console.log("aca")
    try {
        const { motivo_descuento, fecha_inicio, fecha_fin, porcentaje } = req.body;
        console.log('vamos')
        
        if (!motivo_descuento || !fecha_inicio || !fecha_fin || !porcentaje) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const nuevoDescuento = await Descuento.create({
            motivo_descuento,
            fecha_inicio,
            fecha_fin,
            porcentaje
        });

        return res.status(201).json({ message: 'Descuento creado exitosamente', descuento: nuevoDescuento });
    } catch (error) {
        console.error('Error al crear Descuento', error);
        return res.status(500).json({error: 'Error del servidor'});
    }
}

export const obtenerDescuentos = async (req: Request, res: Response): Promise<any> => {
    try {
        const descuentos = await Descuento.findAll();
        return res.status(200).json({ descuentos: descuentos });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener los descuentos', error });
    }
}

export const eliminarDescuento = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID del descuento es obligatorio' });
        }
        const descuento = await Descuento.findByPk(id);
        if (!descuento) {
            return res.status(404).json({ message: 'Descuento no encontrado' });
        }
        await descuento.destroy();
        return res.status(200).json({ message: 'Descuento eliminado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el descuento', error });
    }
}

export const editarDescuento = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const updateData= req.body;
        if (!id) {
            return res.status(400).json({ message: 'El ID del descuento es obligatorio' });
        }
        const descuento = await Descuento.findByPk(id);
        if (!descuento) {
            return res.status(404).json({ message: 'Descuento no encontrado' });
        }
        await descuento.update(updateData);
        return res.status(200).json({ message: 'Descuento actualizado exitosamente', descuento });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el descuento', error });
    }
}