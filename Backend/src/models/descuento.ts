import { DataTypes, Model } from "sequelize";
import sequelize from '../database/connection';

export class Descuento extends Model{
    public Did!: number;
    public motivo_descuento!: string;
    public fecha_inicio!: Date;
    public fecha_fin!: Date;
    public porcentaje!: string; 

}
Descuento.init(
    {
        Did: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true, // Agrega esta línea
        },
        motivo_descuento: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        porcentaje: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Descuento",
        timestamps: false,
    }
);