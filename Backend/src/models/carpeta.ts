import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { Paciente } from './paciente';

export class Carpeta extends Model {
  
    public CarpetaId!: number;
    public numero_documento!: string;
    public imagenes!: Text;
    public fecha!: Date;

}
Carpeta.init(
    {
        CarpetaId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        numero_documento: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Paciente',
                key: 'numero_documento'
            },
        },
        imagenes: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "Carpeta",
        timestamps: false,
    }
)
Carpeta.belongsTo(Paciente, {foreignKey: 'numero_documento',as: 'paciente'});
Paciente.hasOne(Carpeta, { foreignKey: 'numero_documento', as: 'Carpeta' });