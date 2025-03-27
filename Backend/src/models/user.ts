import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';

export class User extends Model{
    public Uid!: number;
    public correo!: string;
    public contrasena!: string;
    public nombre!: string;
    public rol!: string;
}

User.init(
    {
     Uid:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
     },
     correo:{
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
     },
        contrasena:{
                type: DataTypes.STRING,
                allowNull: false
        },
        nombre:{
                type: DataTypes.STRING,
                allowNull: false
        },
        rol:{
                type: DataTypes.STRING,
                allowNull: false
        }

    },
    {
        sequelize,
        tableName: "User",
        timestamps: false,
    }
);