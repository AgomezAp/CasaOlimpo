import { DataTypes, Model } from "sequelize";
import sequelize from '../database/connection';
import { User } from "./user";

export class AgendaNoRegistrados extends Model {
    public ANRid!: number;
    public fecha_cita!: Date;
    public hora_cita!: string;
    public telefono!: string;
    public estado !: boolean;
}

AgendaNoRegistrados.init(

    {
        ANRid: {
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
        hora_cita: {
            type: DataTypes.TIME,
            allowNull: false
        },
        telefono:{
            type: DataTypes.STRING,
            allowNull:false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: "AgendaNoRegistrados",
        timestamps: false,
    }
);
AgendaNoRegistrados.belongsTo(User, {foreignKey: 'correo',as: 'User'});
User.hasOne(AgendaNoRegistrados, { foreignKey: 'correo', as: 'Agenda' });

