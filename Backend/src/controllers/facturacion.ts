import { Request, Response } from 'express';
import { Paciente } from '../models/paciente';
import { Factura } from '../models/facturacion';
import { crearPDF } from '../services/facturacion';

export const crearFactura = async (req: Request, res:Response): Promise<any> => {
    try {
        const { numero_documento, tipo_pago, total } = req.body;
        if (!numero_documento || !tipo_pago || !total) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const paciente = await Paciente.findAll({
            where: {
                numero_documento: numero_documento,
            },
        });
        if (paciente.length === 0){
            return res.status(404).json({message: "El paciente no existe",});
        }
        const nuevaFactura = await Factura.create({
            numero_documento,
            tipo_pago,
            total
        });
        crearPDF(nuevaFactura)
        return res.status(200).json(nuevaFactura);
    } catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const reimprimir = async (req: Request, res: Response): Promise<any> => {
    try {
        const { Fid } = req.body;
        const factura = await Factura.findOne({ where: { Fid } })
        if(factura === null){
            return res.status(404).json({message: 'Factura no encontrada'})
        }
        crearPDF(factura);
        return res.status(200).json(factura);
    } catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const verFacturas = async (req: Request, res: Response): Promise<any> => {
    try {
        const facturas = await Factura.findAll();
        if(facturas === null){
            return res.status(404).json({message: 'Ninguna factura encontrada'})
        }
        return res.status(200).json(facturas)
    } catch (error) {
        console.error('Error al obtener las facturas:', error);
        return res.status(500).json({error: 'Error interno del servidor'});
    }
}

