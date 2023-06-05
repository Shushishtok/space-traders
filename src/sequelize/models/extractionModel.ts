import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { Extraction } from '../../../packages/spacetraders-sdk';

@Table({ tableName: 'extractions' })
export class ExtractionModel extends Model {
	@Column({ type: DataType.STRING })	
		shipSymbol!: string;

	@Column({ type: DataType.JSONB })
		yield!: Extraction;
}