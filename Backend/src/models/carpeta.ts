import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { Paciente } from './paciente';

export class Carpeta extends Model {
  
    public CarpetaId!: number;
    public numero_documento!: string;
    public imagen_metadata!: string; // JSON stringificado con info de las imágenes
    public descripcion?: string;
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
        imagen_metadata: {
            type: DataTypes.TEXT, // Usamos TEXT en lugar de BLOB
            allowNull: true,
            defaultValue: '[]' 
          },
          descripcion: {
            type: DataTypes.STRING,
            allowNull: true
          },
          fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
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