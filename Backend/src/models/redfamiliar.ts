import { DataTypes, Model } from "sequelize";

import sequelize from '../database/connection';
import { Paciente } from "./paciente";

export class RedFamiliar extends Model {
    
    public Nid!: number;
    public nombre!: string;
    public apellido!: string;
    public correo!: string;
    public telefono!: string;
    public numero_documento !: string;
    public numero_documento_familiar!: string;
    public es_responsable!: boolean;
}

RedFamiliar.init(
    {
        Nid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING, // NOTA: Esto parece ser STRING, no DATE
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
        numero_documento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        numero_documento_familiar: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {   
                model: 'Paciente', 
                key: 'numero_documento' 
            }
        },
        es_responsable: { // Añadido este campo que faltaba
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        sequelize,
        tableName: "RedFamiliar",
        timestamps: false,
    }
)
RedFamiliar.belongsTo(Paciente, {foreignKey: 'numero_documento_familiar',as: 'paciente'});
//Paciente.hasMany(RedFamiliar, { foreignKey: 'numero_documento_familiar', as: 'redfamiliar' })