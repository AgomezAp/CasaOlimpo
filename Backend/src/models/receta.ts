import { DataTypes, Model } from "sequelize";

import sequelize from "../database/connection";
import { User } from "./user";
import { Paciente } from "./paciente";
import { Consulta } from "./consulta";

export class Receta extends Model {
  public RecetaId!: number;
  public Uid!: number;
  public Cid!: number;
  public anotaciones!: string;
  public numero_documento!: string;
  public medicamentos!: string;
  public instrucciones!: string;
  public duracion_tratamiento?: string;
  public diagnostico!: string;
  public observaciones?: string;
  public fecha_emision!: Date;
  public estado!: "ACTIVA" | "COMPLETADA" | "CADUCADA";
  public editada!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
Receta.init(
  {
    RecetaId: {     
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Cid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Consulta",
        key: "Cid",
      },
    },
    Uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "Uid",
      },
    },
    numero_documento: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Paciente",
        key: "numero_documento",
      },
    },
    anotaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicamentos: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instrucciones: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duracion_tratamiento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("ACTIVA", "COMPLETADA", "CADUCADA"),
      allowNull: false,
      defaultValue: "ACTIVA",
    },
    editada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "Receta",
    timestamps: false,
  }
);
Receta.belongsTo(User, { foreignKey: "Uid", as: "doctor" });
Receta.belongsTo(Paciente, { foreignKey: "numero_documento", as: "paciente" });
Receta.belongsTo(Consulta, { foreignKey: "Cid", as: "consulta" });
