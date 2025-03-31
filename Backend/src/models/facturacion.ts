import { DataTypes, Model } from "sequelize";

import sequelize from '../database/connection';
import { Paciente } from "./paciente";

export class Factura extends Model{
    public Fid!:Number;
    public numero_documento!:string;
    public tipo_pago!: 'Efectivo' | 'Tarjeta Débito' | 'Tarjeta Crédito' | 'Transferencia';
    public total!: number;
}

Factura.init(
    {
        Fid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true, // Asegúrate de incluir esta línea
        },
        numero_documento: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Paciente',
                key: 'numero_documento'
            },
        },
        tipo_pago: {
            type: DataTypes.ENUM('Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito', 'Transferencia'),
            allowNull: false,
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Factura",
        timestamps: false,
    }
);
Factura.belongsTo(Paciente, {foreignKey: 'numero_documento',as: 'paciente'});
Paciente.hasMany(Factura, { foreignKey: 'numero_documento', as: 'facturas' });