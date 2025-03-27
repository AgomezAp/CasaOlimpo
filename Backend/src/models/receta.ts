import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';

export class Receta extends Model{
    public RecetaId!: number;
    public Uid!: number;
    public anotaciones !: string;

}
Receta.init(
    {
        RecetaId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'Uid'
            },
        },
        anotaciones: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "Receta",
    }
)