import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ tableName: "agents" })
export class AgentModel extends Model {
	@Column({ allowNull: false, type: DataType.STRING })
	accountId!: string;

	@Column({ allowNull: false, primaryKey: true, type: DataType.STRING })
	symbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
	headquarters!: string;

	@Column({ allowNull: false, type: DataType.INTEGER })
	credits!: number;

	@Column({ allowNull: false, type: DataType.STRING })
	startingFaction!: string;

	@Column({ allowNull: false, type: DataType.STRING })
	token!: string;
}