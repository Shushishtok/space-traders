import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ tableName: 'transactions' })
export class TransactionModel extends Model {
	@Column({ type: DataType.INTEGER, allowNull: false })
		pricePerUnit!: number;

	@Column({ type: DataType.STRING, allowNull: false })
		shipSymbol!: string;

	@Column({ type: DataType.STRING, allowNull: false })
		timestamp!: string;

	@Column({ type: DataType.INTEGER, allowNull: false })
		totalPrice!: number;

	@Column({ type: DataType.STRING, allowNull: false })
		tradeSymbol!: string;

	@Column({ type: DataType.STRING, allowNull: false })
		type!: string;

	@Column({ type: DataType.INTEGER, allowNull: false })
		units!: number;

	@Column({ type: DataType.STRING, allowNull: false })
		waypointSymbol!: string;
}