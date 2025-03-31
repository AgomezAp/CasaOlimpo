import { DataTypes, Model } from "sequelize";
import sequelize from '../database/connection';

export class Descuento extends Model{
    public Did!: number;
    public tipo_descuento!: string;
    public fecha_inicio!: Date;
    public fecha_fin!: Date;
    public descripcion!: string; 

}
Descuento.init(
    {
        Did: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true, // Agrega esta línea
        },
        tipo_descuento: {
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
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Descuento",
        timestamps: false,
    }
);