import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';

export class Agenda extends Model {
    public Aid!: number;
    public correo!: string;
    public fecha_cita!: Date;
    public estado !: boolean;
}
Agenda.init(
    {
        Aid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'User',
                key: 'correo'
            },
        },
    
        fecha_cita: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: "Agenda",
        timestamps: false,
    }
);
Agenda.belongsTo(User, {foreignKey: 'correo',as: 'User'});
User.hasOne(Agenda, { foreignKey: 'correo', as: 'Agenda' });