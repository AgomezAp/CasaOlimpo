import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";
import { Paciente } from "./paciente";

interface ConsentimientoInfoAttributes {
  Cid?: number;
  numero_documento: string;
  documento: Buffer;
  fecha_creacion?: Date;
}

export class ConsentimientoInfo extends Model<ConsentimientoInfoAttributes> implements ConsentimientoInfoAttributes {
  public Cid!: number;
  public numero_documento!: string;
  public documento!: Buffer;
  public fecha_creacion!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsentimientoInfo.init(
  {
    Cid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numero_documento: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Paciente,
        key: "numero_documento"
      }
    },
    documento: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize,
    modelName: "ConsentimientoInfo",
    tableName: "ConsentimientoInfo",
    timestamps: true,
  }
);

// Establecer relación con Paciente
ConsentimientoInfo.belongsTo(Paciente, {
  foreignKey: "numero_documento",
  as: "paciente",
});

Paciente.hasMany(ConsentimientoInfo, {
  foreignKey: "numero_documento",
  as: "consentimientos",
});

export default ConsentimientoInfo;