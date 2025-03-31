import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';
import { Paciente } from './paciente';

export class Receta extends Model{
    public RecetaId!: number;
    public Uid!: number;
    public anotaciones !: string;
    public numero_documento !: string;
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
        },
        numero_documento: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Paciente',
                key: 'numero_documento'
            },
        },
    
    },
    {
        sequelize,
        tableName: "Receta",
        timestamps: false,
    }
)
