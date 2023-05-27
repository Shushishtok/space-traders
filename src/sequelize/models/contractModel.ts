import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { ContractTerms, ContractTypeEnum } from '../../packages/spacetraders-sdk';

@Table({ tableName: 'contracts' })
export class ContractModel extends Model {
	@Column({ allowNull: false, type: DataType.STRING, primaryKey: true })
	id!: string;
	
	@Column({ allowNull: false, type: DataType.STRING })
	factionSymbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
	type!: ContractTypeEnum;
	
	@Column({ allowNull: false, type: DataType.JSONB })
	terms!: ContractTerms[];

	@Column({ allowNull: false, type: DataType.BOOLEAN })
	accepted!: boolean;

	@Column({ allowNull: false, type: DataType.BOOLEAN })
	fulfilled!: boolean;

	@Column({ allowNull: false, type: DataType.STRING })
	deadlineToAccept!: string;
}